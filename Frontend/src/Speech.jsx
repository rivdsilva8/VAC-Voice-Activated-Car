import { useState, useEffect, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder";

const Speech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const isRecognitionActive = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Continuous listening
      recognitionRef.current.interimResults = true; // Allow interim results
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.resultIndex][0].transcript
          .trim()
          .toLowerCase();
        console.log("Heard:", lastResult);

        // Update the transcript immediately if listening is active
        if (isListening) {
          setTranscript((prev) => `${prev} ${lastResult}`.trim()); // Update the transcript immediately
        }

        // Check if the last result includes the keyword "blackbird"
        if (lastResult.includes("blackbird")) {
          if (!isRecording) {
            startAudioRecording(); // Start audio recording if "blackbird" is detected
          }
        }
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended.");
        isRecognitionActive.current = false; // Reset recognition state
        // Restart recognition when it ends, only if we want it to listen
        if (isListening) {
          recognitionRef.current.start();
          isRecognitionActive.current = true; // Set it to active again
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Error occurred in speech recognition: ", event.error);
      };
    }
  }, [isListening]);

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
      isRecognitionActive.current = false; // Reset on stop
      console.log("Stopped listening.");
    } else {
      setIsListening(true);
      if (!isRecognitionActive.current) {
        recognitionRef.current.start();
        isRecognitionActive.current = true; // Set to active when starting
        console.log("Started listening for keyword...");
      }
    }
  };

  const startAudioRecording = (startRecording) => {
    if (!isRecording) {
      startRecording(); // Start the audio recording
      setIsRecording(true);
      console.log("Started recording audio.");
    }
  };

  const stopAudioRecording = (stopRecording) => {
    if (isRecording) {
      stopRecording(); // Stop the audio recording
      setIsRecording(false);
      console.log("Stopped recording audio.");
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center pt-5 h-1/2">
        <h1 className="text-4xl">Voice Control</h1>
        <div className="flex flex-row pt-10">
          <button
            className={`transition duration-300 p-2 rounded-md ${
              isListening
                ? "border-blue-500 border strobe text-blue-500 bg-transparent"
                : "bg-blue-500 text-white"
            }`}
            onClick={handleToggleListening}
          >
            {isListening
              ? "Currently Listening, Stop listening"
              : "Start listening"}
          </button>
        </div>
        <div className="pt-5">
          <h2 className="text-2xl">Transcript:</h2>
          <p className="text-lg">{transcript || "Waiting for speech..."}</p>
        </div>
      </div>

      <ReactMediaRecorder
        audio
        render={({ stopRecording, mediaBlobUrl, startRecording }) => (
          <div>
            <button
              onClick={() => stopAudioRecording(stopRecording)}
              disabled={!isRecording}
              className={`mt-4 p-2 rounded-md ${
                isRecording
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {isRecording ? "Stop Recording" : "Recording Stopped"}
            </button>
            {mediaBlobUrl && (
              <div>
                <audio src={mediaBlobUrl} controls />
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default Speech;
