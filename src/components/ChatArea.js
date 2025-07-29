import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';

const ChatArea = ({ activeChannel, isCallActive }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'John Doe',
      avatar: 'JD',
      message: 'Hey everyone! Welcome to the team.',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: 2,
      sender: 'Jane Smith',
      avatar: 'JS',
      message: 'Thanks John! Excited to be here.',
      timestamp: '10:32 AM',
      type: 'text'
    },
    {
      id: 3,
      sender: 'Mike Johnson',
      avatar: 'MJ',
      message: 'Can we schedule a meeting for tomorrow?',
      timestamp: '10:35 AM',
      type: 'text'
    },
    {
      id: 4,
      sender: 'Sarah Wilson',
      avatar: 'SW',
      message: 'I\'ve shared the project files in the Files tab.',
      timestamp: '10:40 AM',
      type: 'text'
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      avatar: 'YU',
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Video Call Interface */}
      {isCallActive && <VideoCall />}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Channel Welcome Message */}
          <div className="text-center py-8 border-b border-gray-200 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to #{activeChannel}!
            </h2>
            <p className="text-gray-600">
              This is the beginning of your conversation in this channel.
            </p>
          </div>

          {/* Message List */}
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatArea;