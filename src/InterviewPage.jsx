import React, { useState, useEffect, useRef } from "react";
import { getOrCreateSessionId } from "./utils/sessionUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

const InterviewPage = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState("");
  
  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const speechQueue = useRef([]);
  const isAudioPlaying = useRef(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // Dummy user info
  const [user] = useState({
    name: "Vaibhav",
    email: "john.doe@example.com",
    role: "web developer",
    avatar: "https://via.placeholder.com/150",
  });

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (interviewStarted) startRecording();
  }, [interviewStarted]);

  const playSpeech = (text) => {
    speechQueue.current.push(text);
    if (!isAudioPlaying.current) playNextInQueue();
  };

  const playNextInQueue = () => {
    if (!speechQueue.current.length) {
      isAudioPlaying.current = false;
      return;
    }

    const nextText = speechQueue.current.shift();
    isAudioPlaying.current = true;

    fetch(`${BACKEND_URL}/text-to-speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: nextText }),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.play();
        audio.onended = () => {
          isAudioPlaying.current = false;
          playNextInQueue();
        };
      })
      .catch((err) => {
        console.error("Speech error:", err);
        isAudioPlaying.current = false;
        playNextInQueue();
      });
  };

  const fetchNextQuestion = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await res.json();
      if (data.question) {
        setQuestion(data.question);
        setResponse("");
        setShowNext(false);
        playSpeech(data.question);
      } else if (data.message === "Interview complete") {
        setInterviewComplete(true);
        stopRecording();
      }
    } catch (error) {
      console.error("Error fetching next question:", error);
      alert("Failed to fetch question.");
    }
  };

  const submitResponse = async () => {
    if (!response.trim()) return alert("Type your response.");
    try {
      const res = await fetch(`${BACKEND_URL}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, response }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(data.feedback);
        setShowNext(true);
        setResponse("");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Failed to submit response.");
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const endInterview = () => {
    speechQueue.current = [];
    isAudioPlaying.current = false;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }

    setQuestion("");
    setResponse("");
    setShowNext(false);
    setInterviewStarted(false);
    setInterviewComplete(true);
    setShowFeedback(true);
    stopRecording();
  };

  const initSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setRecognitionStatus("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setRecognitionStatus("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognitionStatus(`You said: "${transcript}"`);
      setResponse(transcript);
      // Optionally auto-submit:
      // submitResponse();
    };

    recognition.onerror = (event) => {
      setRecognitionStatus(`Error: ${event.error}`);
    };

    recognition.onend = () => {
      setRecognitionStatus((prev) =>
        prev.includes("You said") ? prev : "Speech recognition ended."
      );
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const recorder = new MediaRecorder(stream);
      recordedChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        console.log("Interview video recorded:", url);
        // You can upload the video to backend or allow user to download it here
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Failed to access media devices:", err);
      alert("Could not access camera/microphone.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">InterviewAi</div>
        <div className="nav-right">
          <FontAwesomeIcon
            icon={faUser}
            className="profile-icon"
            onClick={toggleMenu}
          />
          {menuOpen && (
            <div className="dropdown-menu">
              <ul>
                <li onClick={() => navigate("/profile")}>My Profile</li>
                <li onClick={() => navigate("/login")}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="interview-container">
        <div className="top-section">
          <div className="interviewer-section">
            <img
              src="avatar.jpg"
              alt="Interviewer Avatar"
              className="avatar-image"
            />
            <p className="interviewer-name">AI Interviewer</p>
            {interviewStarted ? (
              <div>
                <strong>Question:</strong> {question || "Loading..."}
              </div>
            ) : (
              <button
                onClick={() => {
                  setInterviewStarted(true);
                  fetchNextQuestion();
                }}
              >
                Start Interview
              </button>
            )}
          </div>

          <div className="candidate-section">
            <img
              src="profile.jpg"
              alt="Candidate Avatar"
              className="candidate-photo"
            />
            <h2 className="candidate-name">{user.name}</h2>
            <p className="candidate-role">{user.role}</p>

            <video ref={videoRef} autoPlay muted className="video-preview" />

            {interviewStarted && !interviewComplete && (
              <>
                <input
                  type="text"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Your answer..."
                />
                <button onClick={submitResponse}>Submit Answer</button>
                <button onClick={initSpeechRecognition}>🎙 Speak Answer</button>
                <p>{recognitionStatus}</p>
                {showNext && (
                  <button onClick={fetchNextQuestion}>Next Question</button>
                )}
              </>
            )}

            {interviewComplete && (
              <div className="feedback-container complete">
                <p className="message">Interview complete</p>
                <p className="thank-you">Thank you for participating!</p>
              </div>
            )}
          </div>
        </div>

        <div className="middle-button-container">
          <button className="end-button" onClick={endInterview}>
            End Interview
          </button>
        </div>

        {showFeedback && (
          <div className="feedback-container">
            <h3>Feedback:</h3>
            <p>{feedback}</p>
          </div>
        )}
      </div>

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f0f2f5;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #4b4fbb;
          color: white;
          padding: 10px 20px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }

        .nav-left {
          font-size: 24px;
          font-weight: bold;
        }

        .profile-icon {
          font-size: 24px;
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          top: 35px;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 150px;
        }

        .dropdown-menu li {
          padding: 10px 20px;
          cursor: pointer;
          list-style: none;
        }

        .dropdown-menu li:hover {
          background: #f1f1f1;
        }

        .interview-container {
          margin-top: 60px;
          padding: 20px;
          background: linear-gradient(#e0f2ff, #e5e9ff);
          min-height: 100vh;
        }

        .top-section {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .interviewer-section,
        .candidate-section {
          background: white;
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(75, 79, 187, 0.1);
          width: 320px;
          text-align: center;
        }

        .avatar-image,
        .candidate-photo {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 15px;
          box-shadow: 0 2px 10px rgba(75, 79, 187, 0.2);
        }

        .interviewer-name {
          font-weight: bold;
          font-size: 22px;
          margin-bottom: 20px;
        }

        .candidate-name {
          font-weight: 600;
          font-size: 24px;
          margin: 5px 0;
        }

        .candidate-role {
          font-style: italic;
          color: #555;
          margin-bottom: 15px;
        }

        input[type="text"] {
          width: 90%;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 16px;
          margin-bottom: 10px;
        }

        button {
          background-color: #4b4fbb;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          cursor: pointer;
          font-weight: 600;
          margin: 5px;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #3a3f99;
        }

        .video-preview {
          width: 100%;
          max-height: 240px;
          border-radius: 16px;
          margin-bottom: 15px;
          border: 2px solid #4b4fbb;
          background-color: black;
        }

        .middle-button-container {
          text-align: center;
          margin: 30px 0;
        }

        .end-button {
          background-color: #e25e5e;
          padding: 12px 24px;
          font-size: 18px;
          border-radius: 16px;
          font-weight: 700;
          box-shadow: 0 8px 16px rgba(226, 94, 94, 0.5);
          transition: background-color 0.3s ease;
        }

        .end-button:hover {
          background-color: #c74545;
        }

        .feedback-container {
          background: white;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px 25px;
          border-radius: 20px;
          box-shadow: 0 6px 20px rgba(75, 79, 187, 0.1);
          text-align: center;
        }

        .feedback-container.complete {
          background-color: #4b4fbb;
          color: white;
          font-weight: 700;
          font-size: 20px;
          padding: 30px 20px;
        }

        .message {
          margin-bottom: 20px;
        }

        .thank-you {
          font-weight: 400;
          font-style: italic;
        }
      `}</style>
    </>
  );
};

export default InterviewPage;
