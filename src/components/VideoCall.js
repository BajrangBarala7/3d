import React, { useState } from 'react';

const VideoCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const participants = [
    { id: 1, name: 'John Doe', avatar: 'JD', isVideoOn: true, isMuted: false },
    { id: 2, name: 'Jane Smith', avatar: 'JS', isVideoOn: true, isMuted: true },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', isVideoOn: false, isMuted: false },
    { id: 4, name: 'You', avatar: 'YU', isVideoOn: !isVideoOff, isMuted: isMuted }
  ];

  return (
    <div className="bg-black text-white p-4 border-b border-gray-600">
      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 max-h-64">
        {participants.map((participant) => (
          <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            {participant.isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-4xl font-bold">
                  {participant.avatar}
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                    {participant.avatar}
                  </div>
                  <p className="text-sm">{participant.name}</p>
                </div>
              </div>
            )}
            
            {/* Participant Info */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              <span className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {participant.name}
              </span>
              {participant.isMuted && (
                <span className="text-red-400 text-xs">🔇</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Call Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Mute/Unmute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full transition-colors ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        {/* Video On/Off */}
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-3 rounded-full transition-colors ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? '📹' : '📷'}
        </button>

        {/* Screen Share */}
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-3 rounded-full transition-colors ${
            isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          🖥️
        </button>

        {/* Participants */}
        <button
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
          title="Show participants"
        >
          👥
        </button>

        {/* Chat */}
        <button
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
          title="Chat"
        >
          💬
        </button>

        {/* More Options */}
        <button
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
          title="More options"
        >
          ⋯
        </button>

        {/* End Call */}
        <button
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          title="End call"
        >
          📞
        </button>
      </div>

      {/* Call Info */}
      <div className="text-center mt-4 text-sm text-gray-300">
        <p>Meeting with General Team • 4 participants</p>
        <p className="text-xs mt-1">Call duration: 05:23</p>
      </div>
    </div>
  );
};

export default VideoCall;