'use client';

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Removed DialogTrigger
import { Button } from "@/components/ui/button"; // Keep Button for form submit

// Define the type for a message
interface Message {
  text: string;
  sender: 'You' | 'Driver' | 'ControlStaff'; // Add sender info, including 'ControlStaff' for messages from other dashboard tabs
  timestamp: Date; // Add timestamp
}

interface ChatBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string | null; // Add bus/driver ID prop for specific chat rooms
}

const ChatBox: React.FC<ChatBoxProps> = ({ open, onOpenChange, driverId }) => {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the socket server
    // Use the custom path defined in the server route
    const socket = io({
      path: '/api/socket_io',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Join the specific room if driverId is available
      if (driverId) {
        console.log(`Attempting to join room: ${driverId}`);
        socket.emit('joinRoom', driverId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Listen for messages specific to this room
    socket.on('roomMessage', (data: { room: string; message: string; senderType: 'ControlStaff' | 'Driver'; senderSocketId?: string }) => {
      console.log('Received room message:', data);
      if (data.room === driverId) {
        // Determine sender based on senderType and senderSocketId
        let sender: 'You' | 'Driver' | 'ControlStaff'; // Update type to include 'ControlStaff'
        if (data.senderType === 'ControlStaff') {
          // If the sender is ControlStaff, check if it's from this client instance
          sender = data.senderSocketId === socketRef.current?.id ? 'You' : 'ControlStaff'; // Label as 'ControlStaff' if from another dashboard tab
        } else {
          // If senderType is not ControlStaff, assume it's Driver
          sender = 'Driver';
        }
        setMessages((prevMessages) => [...prevMessages, { text: data.message, sender: sender, timestamp: new Date() }]);
      }
    });

    // Clean up the socket connection on component unmount
    return () => {
      if (socketRef.current) {
        // Leave the room before disconnecting
        if (driverId) {
           console.log(`Attempting to leave room: ${driverId}`);
           socketRef.current.emit('leaveRoom', driverId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [driverId]); // Re-run effect when driverId changes

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = messageInput.trim();
    // Only send message if driverId is selected and socket is connected
    if (messageText && socketRef.current && driverId) {
      const senderSocketId = socketRef.current.id;
      // Emit the message to the server with room information, sender type, and sender socket ID
      // Message will be added to state when received via the 'roomMessage' event
      socketRef.current.emit('sendMessageToRoom', { room: driverId, message: messageText, senderType: 'ControlStaff', senderSocketId });
      // Clear the input field
      setMessageInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogTrigger is now handled by the parent component */}
      {/* Increased width and adjusted positioning slightly */}
      <DialogContent className="fixed bottom-4 right-4 min-w-[60vw] min-h-[90vh] p-4 flex flex-col ">
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              // Adjusted padding, rounded corners, colors, and text alignment for bubble look
              className={`mb-2 px-3 py-2 rounded-2xl max-w-[50%] text-wrap break-words ${
                msg.sender === 'You' || msg.sender === 'ControlStaff'
                  ? 'bg-blue-500 text-white place-self-end rounded-br-none text-right' // Blue for sender (You or ControlStaff), aligned right, text right
                  : 'bg-gray-300 text-gray-800 place-self-start rounded-bl-none text-left' // Gray for receiver (Driver), aligned left, text left
              }`}
            >
              {msg.text}
              <div className={`text-xs mt-1 ${msg.sender === 'You' || msg.sender === 'ControlStaff' ? 'text-gray-200' : 'text-gray-600'}`}>
                {msg.timestamp.toLocaleDateString()} {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-r-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;
