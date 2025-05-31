// import React, { useState } from "react";
// import axios from "axios";
// import "./Login.css"; 
// import { useNavigate } from "react-router-dom";


// export default function Login() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [message, setMessage] = useState(""); 

//   const toggleMode = () => {
//     setIsLogin(!isLogin);
//     setFormData({ email: "", password: "" });
//     setMessage(""); 
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       setMessage("All fields are required!");
//       return;
//     }

//     try {
//       const endpoint = isLogin ? "http://localhost:5000/login" : "http://localhost:5000/register";
//       const response = await axios.post(endpoint, formData);
//       setMessage(response.data.message);

//       if (isLogin && response.status === 200) {
//         localStorage.setItem("email", response.data.email);
//       }
//     } catch (error) {
//       setMessage(error.response?.data?.error || "Login failed!");
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="card">
//         <h2 className="title">{isLogin ? "Login" : "Join Us 🚀"}</h2>
//         {message && <p className="message">{message}</p>}
//         <form onSubmit={handleSubmit} className="form">
//           <div className="input-group">
//             <label>Email</label>
//             <input type="email" name="email" value={formData.email} onChange={handleChange} required />
//           </div>

//           <div className="input-group">
//             <label>Password</label>
//             <input type="password" name="password" value={formData.password} onChange={handleChange} required />
//           </div>

//           <button type="submit" className="btn">{isLogin ? "Login" : "Signup"}</button>
//         </form>

//         <p className="toggle-text">
//           {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
//           <button onClick={toggleMode} className="toggle-btn">{isLogin ? "Signup" : "Login"}</button>
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; 
import { useNavigate } from "react-router-dom"; // Import navigation hook

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(""); 
  const navigate = useNavigate(); // Initialize navigation

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "" });
    setMessage(""); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("All fields are required!");
      return;
    }

    try {
      const endpoint = isLogin ? "http://localhost:5000/login" : "http://localhost:5000/register";
      const response = await axios.post(endpoint, formData);
      setMessage(response.data.message);

      if (response.status === 200) {
        localStorage.setItem("email", response.data.email);
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed!");
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">{isLogin ? "Login" : "Join Us 🚀"}</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn">{isLogin ? "Login" : "Signup"}</button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleMode} className="toggle-btn">{isLogin ? "Signup" : "Login"}</button>
        </p>
      </div>
    </div>
  );
}