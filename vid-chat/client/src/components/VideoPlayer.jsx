import React from 'react';
import { useSocket } from '../Socket.context.jsx';

function VideoPlayer() {
  const { 
    callAccepted, 
    stream, 
    name, 
    call,
    callEnded, 
    myVideoRef, 
    userVideoRef 
  } = useSocket();

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 p-4 w-full h-auto md:h-[60vh]">
      {/* My Video */}
      {stream && (
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-[30vh] md:h-full rounded-xl overflow-hidden shadow-lg bg-gray-800 relative">
          <video
            ref={myVideoRef}
            className="w-full h-full object-cover rounded-xl"
            playsInline
            autoPlay
            muted
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-md">
            {name || 'You'} (Me)
          </div>
        </div>
      )}

      {/* User's Video */}
      {callAccepted && !callEnded ? (
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-[30vh] md:h-full rounded-xl overflow-hidden shadow-lg bg-gray-800 relative">
          <video
            ref={userVideoRef}
            className="w-full h-full object-cover rounded-xl"
            playsInline
            autoPlay
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-md">
            {call.name || 'Caller'}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 h-[30vh] md:h-full rounded-xl overflow-hidden shadow-lg bg-gray-800/60">
          <div className="text-center p-6">
            <div className="text-2xl font-semibold text-gray-300 mb-2">No one connected</div>
            <p className="text-gray-400">Start a call by entering an ID and clicking the call button</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
