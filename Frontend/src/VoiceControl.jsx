import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";

export const VoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition instance

  useEffect(() => {
    // Initialize the SpeechRecognition only once
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.interimResults = true; // Get intermediate results

      // Event handler for speech recognition result
      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setTranscript(currentTranscript);
      };

      // Restart recognition if it ends while still listening
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      console.error("SpeechRecognition API is not supported in this browser.");
    }

    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      console.log("Voice listening stopped");
    } else {
      recognitionRef.current.start();
      console.log("Voice listening started");
    }
    setIsListening((prev) => !prev); // Toggle listening state
  };

  return (
    <div className="flex flex-col justify-center items-center pt-5 h-1/2">
      <h1 className="text-4xl">Voice Control</h1>
      <div className="flex flex-row pt-10">
        <Button
          variant="contained"
          className="bg-yellow-500"
          onClick={handleToggleListening}
        >
          {isListening ? "Stop listening" : "Start listening"}
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="text-2xl">Transcript:</h2>
        <p className="text-lg">{transcript || "Waiting for speech..."}</p>
      </div>
    </div>
  );
};
