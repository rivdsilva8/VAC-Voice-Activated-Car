import { useState, useEffect, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder";

const Speech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]); // Start with an empty array
  const recognitionRef = useRef(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const isRecognitionActive = useRef(false);
  const lastRecognizedKeyword = useRef(""); // Store the last recognized keyword
  const lastResultTimestamp = useRef(Date.now()); // Timestamp of last result
  const lastHeard = useRef(""); // Store the last heard sentence
  const silenceTimer = useRef(null); // Timer reference

  // Refs for audio elements
  const startAudioRef = useRef(new Audio("/assets/start-listening.mp3"));
  const stopAudioRef = useRef(new Audio("/assets/stop-listening.mp3"));

  // Log changes to isListening
  useEffect(() => {
    console.log("isListening changed: ", isListening);

    // Play sound when isListening changes
    if (isListening) {
      startAudioRef.current.play();
    } else {
      stopAudioRef.current.play();
    }
  }, [isListening]);

  const toggleShowTranscript = () => {
    setShowTranscript((prevShow) => !prevShow); // Toggle the display of the transcript
  };

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

        // Check if the last result includes the keyword "blackbird"
        if (lastResult.includes("blackbird")) {
          lastRecognizedKeyword.current = lastResult; // Update last recognized keyword

          if (!isRecording) {
            // Start audio recording if "blackbird" is detected
            startAudioRecording();
          }

          // Clear the previous timer
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
          }

          // Set a new timer to add the last heard sentence after 2 seconds of silence
          silenceTimer.current = setTimeout(() => {
            setTranscript((prevTranscript) => {
              const lastTranscript = prevTranscript[prevTranscript.length - 1];
              const timeSinceLastEntry =
                Date.now() - lastResultTimestamp.current;

              // Allow duplicates after 2 seconds
              if (
                (lastTranscript !== lastHeard.current ||
                  timeSinceLastEntry >= 2000) &&
                lastHeard.current !== ""
              ) {
                lastResultTimestamp.current = Date.now(); // Update timestamp when adding a new entry
                return [...prevTranscript, lastHeard.current];
              }

              return prevTranscript; // Don't add if it's a duplicate within 2 seconds
            });
            lastHeard.current = ""; // Clear last heard sentence after adding it
          }, 1000); // 1 seconds
        }

        // Update the last heard sentence regardless, in case we want to handle it later
        lastHeard.current = lastResult;
      };
      recognitionRef.current.onend = () => {
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
  }, []); // Run only once on mount

  const handleToggleListening = () => {
    if (recognitionRef?.current) {
      // Check if initialized
      if (isListening) {
        recognitionRef.current.stop();
        isRecognitionActive.current = false; // Reset on stop
        setIsListening(false);
        console.log("Stopped listening.");
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current); // Clear the timer when stopping
        }
      } else {
        if (!isRecognitionActive.current) {
          recognitionRef.current.start();
          isRecognitionActive.current = true; // Set to active when starting
          setIsListening(true);
          console.log("Started listening for keyword...");
        }
      }
    } else {
      console.error("Speech recognition is not initialized.");
    }
  };

  const startAudioRecording = () => {
    if (!isRecording) {
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
            className={`transition duration-300 p-2 ${
              isListening
                ? "  strobe text-black bg-yellow-500"
                : "bg-stone-600 text-white"
            }`}
            onClick={handleToggleListening}
          >
            {isListening
              ? "Currently Listening,Click to Stop listening"
              : "Start listening"}
          </button>
        </div>
        <div className="pt-5">
          <h2 className="text-2xl">Commands:</h2>
          <div className="text-lg">
            {transcript.length > 0 ? (
              <ol className="list-decimal pl-5">
                {transcript.map((sentence, index) => (
                  <li key={index}>{sentence.trim()}</li>
                ))}
              </ol>
            ) : (
              "Waiting for speech..."
            )}
          </div>
        </div>
      </div>
      <div className="pt-5">
        <h2 className="text-2xl">Command Array:</h2>
        <button
          onClick={toggleShowTranscript}
          className="mt-2 p-2 bg-green-500 text-white rounded"
        >
          {showTranscript ? "Hide Transcript" : "Show Transcript"}
        </button>
        {showTranscript && (
          <div className="text-lg">
            {transcript.length > 0 ? (
              <p>
                [
                {transcript.map((sentence, index) => (
                  <span key={index}>
                    "{sentence.trim()}"
                    {index < transcript.length - 1 ? ", " : ""}
                  </span>
                ))}
                ]{transcript.length}
              </p>
            ) : (
              "[]"
            )}
          </div>
        )}
      </div>

      <ReactMediaRecorder
        audio
        render={({ stopRecording, mediaBlobUrl, startRecording }) => (
          <div>
            <button
              onClick={() => stopAudioRecording(stopRecording)}
              disabled={!isRecording}
              className={`mt-4 p-2 rounded-md hidden ${
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
