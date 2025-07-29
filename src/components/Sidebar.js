import React, { useState } from 'react';

const Sidebar = ({ activeTeam, activeChannel, setActiveTeam, setActiveChannel }) => {
  const [expandedTeams, setExpandedTeams] = useState(['General']);

  const teams = [
    {
      name: 'General',
      channels: ['General', 'Random', 'Development', 'Design']
    },
    {
      name: 'Project Alpha',
      channels: ['Planning', 'Updates', 'Resources']
    },
    {
      name: 'Marketing',
      channels: ['Campaigns', 'Analytics', 'Content']
    }
  ];

  const toggleTeam = (teamName) => {
    if (expandedTeams.includes(teamName)) {
      setExpandedTeams(expandedTeams.filter(t => t !== teamName));
    } else {
      setExpandedTeams([...expandedTeams, teamName]);
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Teams Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Microsoft Teams</h2>
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
            JD
          </div>
          <span className="ml-2 text-sm">John Doe</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer">
            <span className="mr-3">💬</span>
            <span>Chat</span>
          </div>
          <div className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer">
            <span className="mr-3">📞</span>
            <span>Calls</span>
          </div>
          <div className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer">
            <span className="mr-3">📅</span>
            <span>Calendar</span>
          </div>
          <div className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer">
            <span className="mr-3">📁</span>
            <span>Files</span>
          </div>
        </div>
      </div>

      {/* Teams and Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">TEAMS</h3>
          {teams.map((team) => (
            <div key={team.name} className="mb-2">
              <div 
                className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleTeam(team.name)}
              >
                <span className="mr-2 text-xs">
                  {expandedTeams.includes(team.name) ? '▼' : '▶'}
                </span>
                <span className="text-sm font-medium">{team.name}</span>
              </div>
              
              {expandedTeams.includes(team.name) && (
                <div className="ml-6 mt-1">
                  {team.channels.map((channel) => (
                    <div
                      key={channel}
                      className={`flex items-center p-1 rounded cursor-pointer text-sm ${
                        activeChannel === channel && activeTeam === team.name
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setActiveTeam(team.name);
                        setActiveChannel(channel);
                      }}
                    >
                      <span className="mr-2">#</span>
                      <span>{channel}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <button className="p-2 rounded hover:bg-gray-700">
            <span>⚙️</span>
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <span>❓</span>
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <span>🔔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;