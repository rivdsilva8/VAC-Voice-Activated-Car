// src/components/Socket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://127.0.0.1:5000"; // Change this to your server URL if needed

export const Socket = () => {
  const [socket, setSocket] = useState(null);
  const [commandInput, setCommandInput] = useState("");
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    // Create a socket connection when the component mounts
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["polling"], // Use polling transport
    });
    setSocket(newSocket);

    // Listen for response events
    newSocket.on("response", (data) => {
      setResponses((prevResponses) => [...prevResponses, data]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendCommand = () => {
    if (socket && commandInput) {
      socket.emit("command", commandInput); // Emit the command to the server
      setCommandInput(""); // Clear the input field
    }
  };

  return (
    <div>
      <h1>SocketIO React Component</h1>
      <input
        type="text"
        value={commandInput}
        onChange={(e) => setCommandInput(e.target.value)}
        placeholder="Type your command"
      />
      <button onClick={sendCommand}>Send</button>

      <ul>
        {responses.map((response, index) => (
          <li key={index}>{response}</li>
        ))}
      </ul>
    </div>
  );
};
