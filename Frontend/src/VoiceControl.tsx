import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";

// Extend the Window interface
interface Window {
  webkitSpeechRecognition: any; // Add this line to extend the Window interface
}

export const VoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Create an instance of SpeechRecognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Set up recognition event handlers
  useEffect(() => {
    recognition.interimResults = true; // Get intermediate results

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => (result.isFinal ? result[0].transcript : ""))
        .join("");
      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart recognition if it ends while still listening
        recognition.start();
      }
    };

    return () => {
      recognition.stop(); // Clean up on unmount
    };
  }, [isListening, recognition]);

  const handleToggleListening = () => {
    setIsListening((prev) => {
      if (!prev) {
        recognition.start(); // Start voice recognition
        console.log("Voice listening started");
      } else {
        recognition.stop(); // Stop voice recognition
        console.log("Voice listening stopped");
      }
      return !prev;
    });
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
        <p className="text-lg">{transcript}</p>
      </div>
    </div>
  );
};
