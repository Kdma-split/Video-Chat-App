import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
// import { default as Peer } from 'simple-peer';

const SocketContext = createContext();

const useSocket = () =>  { return useContext (SocketContext) };

const socket = io('http://localhost:3900');

function SocketContextProvider ({ children }) {
    const [stream, setStream] = useState(null);
    const [me, setMe] = useState("");
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState("");
    const [callEnded, setCallEnded] = useState("");
    const [name, setName] = useState("");

    const myVideoRef = useRef(null);
    const userVideoRef = useRef(null);
    const connectionRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(currentStream => {
                setStream(currentStream);
                if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;
            })
            .catch(err => console.error("STREAMS ERROR:", err.name, err.message));
    
        socket.on('me', (id) => { 
            console.log("Received socket ID:", id);
            setMe(id);
        });

        socket.on('callUser', ({ from, name: callerName, signal }) => {
            console.log(`📞INCOMING CALL from  ${from}`);
            console.log("📡 Received Offer Signal:", signal);

            setCall({
                isRecievingCall: true,
                from,
                name: callerName, 
                signal
            });

            console.log ("Value of the call variable:  ", call);
        });
    
        return () => {
            socket.off('me');
            socket.off('callUser');
        };
    }, []);    

    const callUser = (id) => {
        // UNCOMENT DURING PRODUCTION...
        // if (!id || id === me) { 
        //     console.error("Invalid user ID or trying to call yourself!");
        //     return;
        // }

        console.log("CallUser triggered with ID:", id);
        console.log("Current Stream:", stream);

        if (!id) {
            console.error("callUser: Invalid user ID");
            return;
        } 

        if (!stream) {
            console.error ("Stream is undeined!!!");
            return;
        }

        const peer = new Peer ({
            initiator: true,
            // initiator: false,
            trickle: false,
            stream,
            config: {},
        });

        console.log("PEER CONNECTION ESTABLISHED !!!");    

        peer.on ('signal', ( data ) => {
            console.log("🛰 Sending call signal...", data);
            socket.emit ('callUser', {
                userToCall: id,
                signalData: data,
                from: me,
                name
            })
        });

        peer.on ('stream', ( currentStream ) => {
            console.log("Recieving Stream...");
            if (userVideoRef.current) 
                userVideoRef.current.srcObject = currentStream;
            console.error("userVideoRef is null !!!");
        });

        socket.on ('callAccepted', ( signal ) => {
            console.log("✅ Call Accepted! Processing Answer...");
            setCallAccepted (true);
            peer.signal (signal);
        });
        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        console.log("📞 Answering Call...");

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        console.log("✅ Answer Peer Created!");

        peer.on('signal', (signal) => {
            console.log("🛰 Sending answer signal to caller...");
            socket.emit('answerCall', {
                signal,
                to: call.from,
            });
        });

        peer.on('stream', (currentStream) => {
            console.log("📹 Receiving Stream...");
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = currentStream;
            } else {
                console.error("userVideoRef is NULL! Cannot set stream.");
            }
        });

        peer.signal(call.signal);
        console.log("📡 Sent signal back to caller.");

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        
        connectionRef.current.destroy();

        window.location.reload();
    };

    return <SocketContext.Provider value= {{
        call, 
        callAccepted,
        myVideoRef,
        userVideoRef,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        // idToCall,
        // setIdToCall,
    }}>
        { children }
    </SocketContext.Provider>
}

export { 
    SocketContextProvider,
    useSocket,
}
