import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import TopBar from './TopBar';

const TeamsApp = () => {
  const [activeTeam, setActiveTeam] = useState('General');
  const [activeChannel, setActiveChannel] = useState('General');
  const [isCallActive, setIsCallActive] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        activeTeam={activeTeam}
        activeChannel={activeChannel}
        setActiveTeam={setActiveTeam}
        setActiveChannel={setActiveChannel}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar 
          activeChannel={activeChannel}
          isCallActive={isCallActive}
          setIsCallActive={setIsCallActive}
        />
        
        {/* Chat Area */}
        <ChatArea 
          activeChannel={activeChannel}
          isCallActive={isCallActive}
        />
      </div>
    </div>
  );
};

export default TeamsApp;