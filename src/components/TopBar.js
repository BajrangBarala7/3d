import React from 'react';

const TopBar = ({ activeChannel, isCallActive, setIsCallActive }) => {
  return (
    <div className="bg-white border-b border-gray-300 p-4 flex items-center justify-between">
      {/* Channel Info */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          # {activeChannel}
        </h1>
        <span className="ml-4 text-sm text-gray-500">
          12 members
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search in channel..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>

        {/* Video Call Button */}
        <button
          onClick={() => setIsCallActive(!isCallActive)}
          className={`p-2 rounded-md transition-colors ${
            isCallActive
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          title={isCallActive ? 'End Call' : 'Start Video Call'}
        >
          {isCallActive ? '📞' : '📹'}
        </button>

        {/* Audio Call Button */}
        <button
          className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          title="Audio Call"
        >
          📞
        </button>

        {/* Screen Share */}
        <button
          className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          title="Share Screen"
        >
          🖥️
        </button>

        {/* More Options */}
        <button
          className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          title="More Options"
        >
          ⋯
        </button>
      </div>
    </div>
  );
};

export default TopBar;