import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000"; // Set backend URL to port 5000

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [jobDetails, setJobDetails] = useState({ role: "", tools: "", experience: "" });

  useEffect(() => {
    const storedSessionId = localStorage.getItem("session_id");
    setSessionId(storedSessionId || "default_session"); // Fallback session ID
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const uploadResume = async () => {
    const fileInput = document.getElementById("resume");
    const file = fileInput?.files?.[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("session_id", sessionId);

    try {
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Unknown error occurred.");
        return;
      }

      alert("Resume uploaded successfully.");
      setResumeUploaded(true);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload resume. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left" style={{ color: "white" }}>InterviewAi</div>
        <div className="nav-right">
          <FontAwesomeIcon icon={faUser} className="profile-icon" onClick={toggleMenu} />
          {menuOpen && (
            <div className="dropdown-menu">
              <ul>
                <li onClick={() => navigate("/profile")}>My Profile</li>
                <li onClick={() => navigate("/")}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Resume Upload and Job Info Cards */}
      <div className="top-cards">
        <div className="cards">
          <h3>Upload Resume</h3>
          <input type="file" id="resume" accept=".pdf,.doc,.docx" />
          <button className="btn upload-btn" onClick={uploadResume}>
            Upload Resume
          </button>
        </div>

        <div className="cards">
          <h3>Job Details</h3>
          <input type="text" name="role" placeholder="Job Role" onChange={(e) => setJobDetails({ ...jobDetails, role: e.target.value })} style={{color:"black"}} />
          <input type="text" name="tools" placeholder="Tools" onChange={(e) => setJobDetails({ ...jobDetails, tools: e.target.value })} style={{color:"black"}} />
          <input type="text" name="experience" placeholder="Experience" onChange={(e) => setJobDetails({ ...jobDetails, experience: e.target.value })} style={{color:"black"}} />
          <button className="btn" onClick={() => {
            const { role, tools, experience } = jobDetails;
            if (role && tools && experience) {
              setFormSubmitted(true);
              alert("Form submitted successfully");
            } else {
              alert("Please fill out all job details");
            }
          }}>
            Submit
          </button>
        </div>
      </div>

      {/* Start Interview Button */}
      <div className="start-button-container">
        <button className="btn start-btn" onClick={() => navigate("/interview")} disabled={!resumeUploaded}>
          Start Interview
        </button>
      </div>

      {/* Interview Options */}
      <div className="interview-cards">
        {[
          { name: "Software Developer", desc: "Interview for general software development." },
          { name: "Full Stack Developer", desc: "Frontend and backend focused interview." },
          { name: "Mobile App Developer", desc: "Interview for iOS/Android app development." },
          { name: "SSB Interview", desc: "Service Selection Board interview simulation." },
          { name: "Frontend Developer", desc: "Focused on HTML, CSS, JS, and frameworks." },
          { name: "Backend Developer", desc: "Server, DB, and backend service interview." },
          { name: "Software Developer", desc: "Interview for general software development." },
          { name: "Full Stack Developer", desc: "Frontend and backend focused interview." },
        ].map((item, index) => (
          <div className="card interview-card" key={index}>
            <h3>{item.name}</h3>
            <p>{item.desc}</p>
            <button className="btn" onClick={() => navigate("/interview")}>
              Start Interview
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;





