import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
          {/* Avatar */}
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {message.avatar}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Sender and Timestamp */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                {message.sender}
              </span>
              <span className="text-xs text-gray-500">
                {message.timestamp}
              </span>
            </div>

            {/* Message Text */}
            <div className="text-gray-800 text-sm leading-relaxed">
              {message.message}
            </div>

            {/* Message Actions */}
            <div className="flex items-center space-x-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                👍 React
              </button>
              <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                💬 Reply
              </button>
              <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                ⋯ More
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;