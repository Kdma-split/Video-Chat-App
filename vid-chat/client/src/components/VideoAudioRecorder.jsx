import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../Socket.context.jsx';

function VideoAudioRecorder() {
  const { stream, callAccepted, userVideoRef } = useSocket();
  const [isRecordingLocal, setIsRecordingLocal] = useState(false);
  const [isRecordingRemote, setIsRecordingRemote] = useState(false);
  const [recordingTimeLocal, setRecordingTimeLocal] = useState(0);
  const [recordingTimeRemote, setRecordingTimeRemote] = useState(0);
  
  const localMediaRecorderRef = useRef(null);
  const remoteMediaRecorderRef = useRef(null);
  const localMediaChunksRef = useRef([]);
  const remoteMediaChunksRef = useRef([]);
  const localTimerRef = useRef(null);
  const remoteTimerRef = useRef(null);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording local audio and video
  const startLocalRecording = () => {
    if (!stream) return;
    
    // Use the full stream with both audio and video tracks
    localMediaChunksRef.current = [];
    localMediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm' // Better compatibility for video recording
    });
    
    localMediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        localMediaChunksRef.current.push(event.data);
      }
    };
    
    localMediaRecorderRef.current.onstop = () => {
      const mediaBlob = new Blob(localMediaChunksRef.current, { type: 'video/webm' });
      const mediaUrl = URL.createObjectURL(mediaBlob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = mediaUrl;
      downloadLink.download = `local-recording-${new Date().toISOString()}.webm`;
      downloadLink.click();
      
      // Also extract audio for Whisper API
      extractAudioFromVideo(mediaBlob, 'local');
      
      // Clean up
      setRecordingTimeLocal(0);
      setIsRecordingLocal(false);
    };
    
    // Start recording
    localMediaRecorderRef.current.start();
    setIsRecordingLocal(true);
    
    // Start timer
    localTimerRef.current = setInterval(() => {
      setRecordingTimeLocal(prev => prev + 1);
    }, 1000);
  };

  // Stop recording local media
  const stopLocalRecording = () => {
    if (localMediaRecorderRef.current && isRecordingLocal) {
      localMediaRecorderRef.current.stop();
      clearInterval(localTimerRef.current);
    }
  };

  // Start recording remote audio and video
  const startRemoteRecording = () => {
    if (!callAccepted || !userVideoRef.current || !userVideoRef.current.srcObject) {
      console.error("Cannot record: no remote stream available");
      return;
    }
    
    // Get the full remote stream with both audio and video
    const remoteStream = userVideoRef.current.srcObject;
    
    remoteMediaChunksRef.current = [];
    remoteMediaRecorderRef.current = new MediaRecorder(remoteStream, {
      mimeType: 'video/webm'
    });
    
    remoteMediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        remoteMediaChunksRef.current.push(event.data);
      }
    };
    
    remoteMediaRecorderRef.current.onstop = () => {
      const mediaBlob = new Blob(remoteMediaChunksRef.current, { type: 'video/webm' });
      const mediaUrl = URL.createObjectURL(mediaBlob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = mediaUrl;
      downloadLink.download = `remote-recording-${new Date().toISOString()}.webm`;
      downloadLink.click();
      
      // Also extract audio for Whisper API
      extractAudioFromVideo(mediaBlob, 'remote');
      
      // Clean up
      setRecordingTimeRemote(0);
      setIsRecordingRemote(false);
    };
    
    // Start recording
    remoteMediaRecorderRef.current.start();
    setIsRecordingRemote(true);
    
    // Start timer
    remoteTimerRef.current = setInterval(() => {
      setRecordingTimeRemote(prev => prev + 1);
    }, 1000);
  };

  // Stop recording remote media
  const stopRemoteRecording = () => {
    if (remoteMediaRecorderRef.current && isRecordingRemote) {
      remoteMediaRecorderRef.current.stop();
      clearInterval(remoteTimerRef.current);
    }
  };

  // Extract audio from video recording for Whisper API
  const extractAudioFromVideo = async (videoBlob, source) => {
    try {
      // Create an audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Convert video blob to audio buffer
      const videoArrayBuffer = await videoBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(videoArrayBuffer);
      
      // Create a new audio buffer with the same configuration
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      // Copy data to the offline context
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0);
      
      // Render audio
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV format
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      // Create download link for audio
      const audioUrl = URL.createObjectURL(wavBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = audioUrl;
      downloadLink.download = `${source}-audio-${new Date().toISOString()}.wav`;
      downloadLink.click();
      
    } catch (error) {
      console.error("Error extracting audio:", error);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer) => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2;
    const sampleRate = buffer.sampleRate;
    const wav = new ArrayBuffer(44 + length);
    const view = new DataView(wav);
    
    // Write WAV header
    // "RIFF" chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);           // subchunk1Size
    view.setUint16(20, 1, true);            // audioFormat (PCM)
    view.setUint16(22, numOfChannels, true);// numChannels
    view.setUint32(24, sampleRate, true);   // sampleRate
    view.setUint32(28, sampleRate * 2 * numOfChannels, true); // byteRate
    view.setUint16(32, numOfChannels * 2, true); // blockAlign
    view.setUint16(34, 16, true);           // bitsPerSample
    
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write audio data
    const channels = [];
    let offset = 44;
    
    for (let i = 0; i < numOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numOfChannels; c++) {
        // Convert float to int16
        const sample = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([view], { type: 'audio/wav' });
  };

  // Helper function to write strings to DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
      if (remoteTimerRef.current) clearInterval(remoteTimerRef.current);
      
      if (localMediaRecorderRef.current && localMediaRecorderRef.current.state === 'recording') {
        localMediaRecorderRef.current.stop();
      }
      
      if (remoteMediaRecorderRef.current && remoteMediaRecorderRef.current.state === 'recording') {
        remoteMediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full bg-gray-800/80 backdrop-blur rounded-xl shadow-lg border border-gray-700 p-4 mt-4">
      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        Video & Audio Recording
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Media Recording */}
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium">Your Video & Audio</h3>
            {isRecordingLocal && (
              <span className="inline-flex items-center text-red-400 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                {formatTime(recordingTimeLocal)}
              </span>
            )}
          </div>
          
          {!isRecordingLocal ? (
            <button
              onClick={startLocalRecording}
              disabled={!stream}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                stream ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopLocalRecording}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              Stop Recording
            </button>
          )}
          <p className="text-gray-400 text-xs mt-2">
            Records your video and extracts audio for translation with Whisper API
          </p>
        </div>
        
        {/* Remote Media Recording */}
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium">Caller's Video & Audio</h3>
            {isRecordingRemote && (
              <span className="inline-flex items-center text-red-400 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                {formatTime(recordingTimeRemote)}
              </span>
            )}
          </div>
          
          {!isRecordingRemote ? (
            <button
              onClick={startRemoteRecording}
              disabled={!callAccepted}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                callAccepted ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRemoteRecording}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              Stop Recording
            </button>
          )}
          <p className="text-gray-400 text-xs mt-2">
            Records caller's video and extracts audio for translation with Whisper API
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>Video recordings will be saved as .webm files and audio will be extracted as .wav files for Whisper API translation.</p>
      </div>
    </div>
  );
}

export default VideoAudioRecorder;
