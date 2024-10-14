import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://127.0.0.1:5000"; 
export const Socket = ({ transcript }) => {
  const [socket, setSocket] = useState(null);
  const [commandInput, setCommandInput] = useState("");
  const [responses, setResponses] = useState([]);
  const startAudioRef = useRef(new Audio("/yellowNotification.wav"));
  useEffect(() => {

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["polling"], 
    });
    setSocket(newSocket);

    newSocket.on("response", (data) => {
      setResponses((prevResponses) => [
        ...prevResponses,
        { type: "server", message: data },
      ]);
      startAudioRef.current.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("useEffect Triggered, transcripts has changed");
    if (socket) {
      socket.emit("command", transcript[transcript?.length - 1]);
      setResponses((prevResponses) => [
        ...prevResponses,
        { type: "client", message: transcript[transcript?.length - 1] },
      ]);
    }
  }, [transcript]);

  const sendCommand = () => {
    if (socket && commandInput) {
      socket.emit("command", commandInput); 
      setResponses((prevResponses) => [
        ...prevResponses,
        { type: "client", message: commandInput },
      ]); 
      setCommandInput(""); 
    }
  };

  return (
    <div className="bg-zinc-500 rounded-md p-5 m-2 w-1/4">
      <h2 className="text-4xl pb-4">SocketIO React Component</h2>
      <input
        type="text"
        value={commandInput}
        className="bg-stone-950 p-2 pr-1 text-white rounded-s-md"
        onChange={(e) => setCommandInput(e.target.value)}
        placeholder="Type your command"
      />
      <button
        onClick={sendCommand}
        className="bg-blue-700 p-2 hover:bg-blue-800 rounded-r-md"
      >
        Send
      </button>

      <ul className="my-2 bg-stone-950 text-black rounded-md p-4">
        {responses.length > 0 ? (
          responses.map((response, index) => (
            <li
              key={index}
              className={`flex ${
                response.type === "client" ? "justify-start" : "justify-end"
              }`}
            >
              <span
                className={`p-2 rounded-md ${
                  response.type === "client"
                    ? "bg-blue-500 text-white my-2"
                    : "bg-gray-300 text-black"
                }`}
              >
                {response.message}
              </span>
            </li>
          ))
        ) : (
          <li>Start Sending Commands</li>
        )}
      </ul>
    </div>
  );
};
