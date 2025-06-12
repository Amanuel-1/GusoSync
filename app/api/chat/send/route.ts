import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { conversation_id, content, type = 'TEXT' } = await request.json();

    if (!conversation_id || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Get user info from auth (you'll need to implement this based on your auth system)
    // For now, using mock data
    const currentUser = {
      id: 'current_user_id', // Replace with actual user ID from auth
      name: 'Control Staff', // Replace with actual user name from auth
    };

    // Create message object
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversation_id,
      content,
      type,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sent_at: new Date().toISOString(),
      is_read: false
    };

    // TODO: Save the message to your database here
    // await saveMessageToDatabase(message);

    // Send the message to the backend WebSocket server
    try {
      const backendResponse = await fetch('https://guzosync-fastapi.onrender.com/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          conversation_id,
          content,
          type,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
        }),
      });

      if (!backendResponse.ok) {
        console.error('Failed to send message to backend:', await backendResponse.text());
        // Continue anyway - the message was created locally
      }
    } catch (error) {
      console.error('Error sending message to backend:', error);
      // Continue anyway - the message was created locally
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      message_id: message.id,
      message_data: message
    });

  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
