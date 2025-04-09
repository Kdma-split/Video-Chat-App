import React from 'react';
import { useSocket } from '../Socket.context.jsx';

function Notifications() {
  const { answerCall, call, callAccepted } = useSocket();

  return (
    call.isRecievingCall && !callAccepted && (
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col sm:flex-row items-center gap-3 animate-pulse max-w-sm w-full md:max-w-md z-50">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </div>
          <span className="font-semibold">{`${call.name || 'Someone'} is calling!`}</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex-1 sm:flex-initial flex items-center justify-center gap-1 transition-colors"
            onClick={answerCall}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Answer
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex-1 sm:flex-initial flex items-center justify-center gap-1 transition-colors"
            onClick={() => window.location.reload()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Decline
          </button>
        </div>
      </div>
    )
  );
}

export default Notifications;
