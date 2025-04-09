import React from 'react';
import VideoPlayer from '../components/VideoPlayer.jsx';
import Notifications from '../components/Notifications.jsx';
import Options from '../components/Options.jsx';
import VideoAudioRecorder from '../components/VideoAudioRecorder.jsx';

function VideoChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* App Header */}
      <header className="flex justify-center items-center h-16 w-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <h1 className="text-white font-bold text-2xl">Connect</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Status Bar */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-800/50 backdrop-blur rounded-full px-4 py-2 text-sm text-gray-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Connected to server
          </div>
        </div>

        {/* Video Area */}
        <div className="mb-6">
          <VideoPlayer />
        </div>

        {/* Video & Audio Recording Section */}
        <VideoAudioRecorder />

        {/* Controls Area */}
        <Options>
          <Notifications />
        </Options>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Video Chat App &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}

export default VideoChatPage;
