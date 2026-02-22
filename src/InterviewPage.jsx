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
  const currentAudioRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Candidate",
    avatar: "https://via.placeholder.com/150",
  }); // Static user data

  const speechQueue = useRef([]);
  const isAudioPlaying = useRef(false);

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

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
        setResponse(""); // Clear input area after submitting response
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Failed to submit response.");
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggle the menu open/close
  };

const endInterview = () => {
    // ✅ Stop and clear audio playback
    speechQueue.current = [];
    isAudioPlaying.current = false;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }

    // Clear UI state
    setQuestion("");
    setResponse("");
    setShowNext(false);
    setInterviewStarted(false);
    setInterviewComplete(true);
    setShowFeedback(true);
  };


  return (
    <>
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
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

        .nav-right {
          position: relative;
        }

        .profile-icon {
          font-size: 24px;
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          top: 35px;
          right: 0;
          background-color: white;
          color: black;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 10px 0;
          width: 150px;
        }

        .dropdown-menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dropdown-menu li {
          padding: 10px 20px;
          cursor: pointer;
        }

        .dropdown-menu li:hover {
          background-color: #f1f1f1;
        }

        .interview-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(#e0f2ff, #e5e9ff);
          padding: 20px;
          box-sizing: border-box;
        }

        .top-section {
          display: flex;
          justify-content: center;
          gap: 40px;
          width: 90%;
          margin-top: 3rem;
        }

        .interviewer-section, .candidate-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 40%;
          padding: 20px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-top: 2rem;
        }

        .avatar-image, .candidate-photo {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 5px solid #8bc8ff;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .candidate-name, .interviewer-name {
          font-size: 30px;
          font-weight: bold;
          color: #4b4fbb;
          margin-top: 15px;
        }

        input[type="text"] {
          margin: 10px 0;
          padding: 10px;
          width: 100%;
          max-width: 300px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        button {
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background-color: #4b4fbb;
          color: white;
        }

        .middle-button-container {
          margin-top: 3rem;
          display: flex;
          justify-content: center;
        }

        .end-button {
          background-color: #e74c3c;
          color: white;
          padding: 15px 30px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .end-button:hover {
          background-color: #c0392b;
        }

        .feedback-container {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          width: 80%;
          margin: 20px auto;
          text-align: center;
          height: auto;
        }

        .feedback-container.complete {
  border: 2px solid #4CAF50; /* Green border */
  background-color: #e9f7e9; /* Light green background */
}

.feedback-container.in-progress {
  border: 2px solid #FFC107; /* Yellow border */
  background-color: #fff8e1; /* Light yellow background */
}

.feedback-container .message {
  font-size: 20px;
  font-weight: bold;
  color: #4b4fbb;
}

.feedback-container .thank-you {
  font-size: 16px;
  color: #4CAF50;
  margin-top: 10px;
}


}
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left" style={{ color: "white" }}>InterviewAi</div>
        <div className="nav-right">
          <FontAwesomeIcon icon={faUser} className="profile-icon" onClick={toggleMenu} />
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
            <img src="avatar.jpg" alt="Interviewer Avatar" className="avatar-image" />
            <p className="interviewer-name">AI Interviewer</p>
            {interviewStarted ? (
              <div className="interview-text">
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
            {user && (
              <>
                <img src="profile.png" alt="Candidate Avatar" className="candidate-photo" />
                <h2 className="candidate-name">surbhi</h2>
                <p className="candidate-role">web developer</p>
              </>
            )}

            {interviewStarted && !interviewComplete && (
              <>
                <input
                  type="text"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Your answer..."
                  style={{ color: "black" }}
                />
                <button onClick={submitResponse}>Submit Answer</button>
                {showNext && (
                  <button onClick={fetchNextQuestion}>Next Question</button>
                )}
              </>
            )}

           {interviewComplete && (
  <div className={`feedback-container ${interviewComplete ? "complete" : "in-progress"}`}>
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
    </>
  );
};

export default InterviewPage;

