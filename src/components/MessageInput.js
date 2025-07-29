import React, { useState } from 'react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showFormatting, setShowFormatting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-300 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Formatting Toolbar */}
        {showFormatting && (
          <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded-t-lg border border-gray-200">
            <button className="p-1 hover:bg-gray-200 rounded text-sm" title="Bold">
              <strong>B</strong>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded text-sm" title="Italic">
              <em>I</em>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded text-sm" title="Underline">
              <u>U</u>
            </button>
            <div className="w-px h-4 bg-gray-300"></div>
            <button className="p-1 hover:bg-gray-200 rounded text-sm" title="Link">
              🔗
            </button>
            <button className="p-1 hover:bg-gray-200 rounded text-sm" title="Emoji">
              😊
            </button>
            <button className="p-1 hover:bg-gray-200 rounded text-sm" title="Mention">
              @
            </button>
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              {/* Input Actions */}
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowFormatting(!showFormatting)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Formatting"
                >
                  🎨
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Attach file"
                >
                  📎
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Emoji"
                >
                  😊
                </button>
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className={`p-3 rounded-lg transition-colors ${
                message.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="hover:text-blue-600 transition-colors">
              🎥 Record video
            </button>
            <button className="hover:text-blue-600 transition-colors">
              🎤 Record audio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;