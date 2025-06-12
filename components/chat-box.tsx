'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RealTimeSocketService } from "@/utils/socket";
import { useNotifications } from "@/hooks/useNotifications";
import { authService } from "@/services/authService";
import type { Bus } from "@/types/bus"

// Define the type for a message
interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  sent_at: string;
  is_read: boolean;
}

interface TypingUser {
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

interface ChatBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string | null; // Add bus/driver ID prop for specific chat rooms
  selectedBus: Bus | null; // Add selected bus information for driver details
}

const ChatBox: React.FC<ChatBoxProps> = ({ open, onOpenChange, driverId, selectedBus }) => {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUserId(user?.id || 'current_user_id');
      } catch (error) {
        console.error('Error getting current user:', error);
        setCurrentUserId('current_user_id'); // Fallback
      }
    };
    getCurrentUser();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Generate conversation ID based on driver ID
  useEffect(() => {
    if (driverId) {
      setConversationId(`driver_${driverId}`);
    } else {
      setConversationId(null);
    }
  }, [driverId]);

  // WebSocket event handlers
  const handleNewMessage = useCallback((data: any) => {
    console.log('📨 Received new message:', data);
    if (data.conversation_id === conversationId) {
      const newMessage: Message = {
        id: data.message.id,
        content: data.message.content,
        sender_id: data.message.sender_id,
        sender_name: data.message.sender_name || 'Unknown',
        type: data.message.type || 'TEXT',
        sent_at: data.message.sent_at,
        is_read: false
      };

      setMessages(prev => [...prev, newMessage]);

      // Add chat notification if message is from someone else
      if (data.message.sender_id !== currentUserId) {
        addNotification({
          id: `chat_${data.message.id}`,
          title: `New message from ${newMessage.sender_name}`,
          message: newMessage.content,
          notification_type: "CHAT_MESSAGE",
          related_entity: {
            entity_type: "chat_message",
            chat_id: conversationId!,
            message_id: newMessage.id
          },
          timestamp: new Date().toISOString(),
          is_read: false
        });
      }
    }
  }, [conversationId, addNotification]);

  const handleTypingStatus = useCallback((data: any) => {
    console.log('⌨️ Received typing status:', data);
    if (data.conversation_id === conversationId) {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.user_id !== data.user_id);
        if (data.is_typing) {
          return [...filtered, {
            user_id: data.user_id,
            user_name: data.user_name || 'Unknown',
            is_typing: true
          }];
        }
        return filtered;
      });
    }
  }, [conversationId]);

  const handleMessageRead = useCallback((data: any) => {
    console.log('👁️ Message read:', data);
    if (data.conversation_id === conversationId) {
      setMessages(prev => prev.map(msg =>
        msg.id === data.message_id ? { ...msg, is_read: true } : msg
      ));
    }
  }, [conversationId]);

  // Set up WebSocket listeners
  useEffect(() => {
    if (!conversationId) return;

    const socket = RealTimeSocketService.getInstance();

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('typing_status', handleTypingStatus);
    socket.on('message_read', handleMessageRead);

    // Join conversation
    socket.joinConversation(conversationId);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_status', handleTypingStatus);
      socket.off('message_read', handleMessageRead);
    };
  }, [conversationId, handleNewMessage, handleTypingStatus, handleMessageRead]);

  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!conversationId) return;

    const socket = RealTimeSocketService.getInstance();

    if (!isTyping) {
      setIsTyping(true);
      socket.sendTypingIndicator(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.sendTypingIndicator(conversationId, false);
    }, 1000);
  }, [conversationId, isTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = messageInput.trim();

    if (!messageText || !conversationId || !currentUserId) return;

    try {
      // Send message via API
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: messageText,
          type: 'TEXT'
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Add the message to local state immediately for better UX
        if (result.message_data) {
          const newMessage: Message = {
            id: result.message_data.id,
            content: result.message_data.content,
            sender_id: result.message_data.sender_id,
            sender_name: result.message_data.sender_name,
            type: result.message_data.type,
            sent_at: result.message_data.sent_at,
            is_read: false
          };
          setMessages(prev => [...prev, newMessage]);
        }

        setMessageInput('');
        // Stop typing indicator
        if (isTyping) {
          setIsTyping(false);
          const socket = RealTimeSocketService.getInstance();
          socket.sendTypingIndicator(conversationId, false);
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (open && conversationId && messages.length > 0 && currentUserId) {
      const socket = RealTimeSocketService.getInstance();
      const unreadMessages = messages.filter(msg => !msg.is_read && msg.sender_id !== currentUserId);

      unreadMessages.forEach(msg => {
        socket.markMessageRead(conversationId, msg.id);
      });
    }
  }, [open, conversationId, messages, currentUserId]);

  // Get driver information for the title
  const driverName = selectedBus?.driver?.name || 'Unknown Driver';
  const driverPhone = selectedBus?.driver?.phone || 'N/A';
  const busName = selectedBus?.name || 'Unknown Bus';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogTrigger is now handled by the parent component */}
      {/* Increased width and adjusted positioning slightly */}
      <DialogContent className="fixed bottom-4 right-4 min-w-[60vw] min-h-[90vh] p-4 flex flex-col ">
        <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
          Chat with {driverName} ({busName})
          {driverPhone !== 'N/A' && (
            <div className="text-sm font-normal text-gray-600 mt-1">
              📞 {driverPhone}
            </div>
          )}
        </DialogTitle>
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 px-3 py-2 rounded-2xl max-w-[50%] text-wrap break-words ${
                  message.sender_id === currentUserId
                    ? 'bg-blue-500 text-white place-self-end rounded-br-none text-right'
                    : 'bg-gray-300 text-gray-800 place-self-start rounded-bl-none text-left'
                }`}
              >
                <div className="text-sm">
                  <strong>{message.sender_name}:</strong> {message.content}
                </div>
                <div className={`text-xs mt-1 flex justify-between ${
                  message.sender_id === currentUserId ? 'text-gray-200' : 'text-gray-600'
                }`}>
                  <span>{new Date(message.sent_at).toLocaleTimeString()}</span>
                  {message.sender_id === currentUserId && (
                    <span>{message.is_read ? '✓✓' : '✓'}</span>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic mb-2">
              {typingUsers.map(user => user.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!driverId}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-r-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!driverId || !messageInput.trim()}
          >
            Send
          </button>
        </form>

        {!driverId && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Please select a bus to start chatting with the driver.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;
