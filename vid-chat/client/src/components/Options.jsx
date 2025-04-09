import React from 'react';
import { useSocket } from '../Socket.context.jsx';

function Options({ children }) {
  const {
    me,
    callAccepted,
    name,
    setName,
    callEnded,
    leaveCall,
    callUser,
    // idToCall,
    // setIdToCall,
  } = useSocket();

  const [idToCall, setIdToCall] = React.useState("");
  const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);

  const copyClipboard = () => {
    let textToCopy = me;
    console.log(textToCopy);
    navigator.clipboard.writeText(textToCopy)
      .then(() => setCopiedToClipboard(true))
      .catch(err => console.error("Failed to copy text: ", err));
  };

  const handleChange = (e) => {
    setIdToCall(e.target.value);
    // setIdToCall(prevVal => prevVal = e.target.value);
    console.log(idToCall);
  }

  return (
    <div className="flex flex-col justify-center items-center p-4 w-full">
      <div className="flex flex-row w-full justify-center items-center gap-4">
        
        {/* Account Info */}
        <div className="w-1/2 p-2 bg-gray-800 rounded-md shadow-md">
          <span className="text-lg font-bold text-white">Account Info</span>
          <input
            type="text"
            className="bg-gray-700 text-white w-full p-2 rounded-md border-2 border-gray-600 focus:outline-none focus:border-blue-500 mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold mt-2 p-2 rounded-md"
            onClick={copyClipboard}
          >
            {copiedToClipboard ? "Copied!" : "Copy Account Info"}
          </button>
        </div>

        {/* Call Actions */}
        <div className="w-1/2 p-2 bg-gray-800 rounded-md shadow-md">
          <span className="text-lg font-bold text-white">Place A Call</span>
          <input
            type="text"
            className="bg-gray-700 text-white w-full p-2 rounded-md border-2 border-gray-600 focus:outline-none focus:border-blue-500 mt-2"
            value={idToCall}
            onChange={(e) => handleChange(e)}
          />
          {callAccepted && !callEnded ? (
            <button
              className="w-full bg-red-600 hover:bg-red-800 text-white font-semibold mt-2 p-2 rounded-md"
              onClick={leaveCall}
            >
              Leave Call
            </button>
          ) : (
            <button
              className="w-full bg-green-600 hover:bg-green-800 text-white font-semibold mt-2 p-2 rounded-md"
              onClick={() => callUser(idToCall)}
            >
              Call
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default Options;
