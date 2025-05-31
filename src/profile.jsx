import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: ""
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

useEffect(() => {
  const userData = localStorage.getItem("user");

  try {
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setPreview(parsed?.avatar || ""); // Using optional chaining to avoid errors
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setUser({ ...user, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = user._id;
      const response = await axios.put("http://localhost:5000/update-profile", {
        user_id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      });
      alert(response.data.message);
      localStorage.setItem("user", JSON.stringify(user));
      setIsEditing(false); // Switch to view mode after saving
    } catch (err) {
      setError(err.response ? err.response.data.error : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  

  // --- STYLES --- 
  const containerStyle = {
    padding: "2rem",
    maxWidth: "800px",
    margin: "2rem auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const cardStyle = {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "2px solid #f1f1f1",
  };

  const avatarStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "1rem",
    border: "3px solid #4caf50",
  };

  const uploadBtnStyle = {
    display: "inline-block",
    marginBottom: "1.5rem",
    backgroundColor: "#4caf50",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "1rem",
  };

  const formGroupStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    marginBottom: "1rem",
    marginRight: "10rem",
  };

  const labelStyle = {
    flex: "1",
    fontWeight: "bold",
    color: "#333",
    marginRight: "1rem",
    textAlign: "right",
  };

  const inputStyle = {
    flex: "2",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    color: "black",
    backgroundColor: "white",
    transition: "border-color 0.3s",
  };

  const saveBtnStyle = {
    marginTop: "1.5rem",
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  };

  const saveBtnHoverStyle = {
    backgroundColor: "#0056b3",
  };

  const profileTextStyle = {
    fontSize: "1.2rem",
    marginBottom: "1rem",
    color: "#333",
  };

  const editBtnStyle = {
    backgroundColor: "#28a745",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "1rem",
  };

  return (
    <div style={containerStyle}>
      <h2>My Profile</h2>
      <div style={cardStyle}>
        {preview && <img src={preview} alt="Avatar" style={avatarStyle} />}
        
        {isEditing ? (
          <>
            <label htmlFor="avatarUpload" style={uploadBtnStyle}>
              Upload Avatar
            </label>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <div style={formGroupStyle}>
              <label style={labelStyle}>Name:</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email:</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Phone:</label>
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Role:</label>
              <input
                type="text"
                name="role"
                value={user.role}
                onChange={handleChange}
                placeholder="Enter your role"
                style={inputStyle}
              />
            </div>

            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <button
              style={saveBtnStyle}
              onClick={handleSave}
              disabled={loading}
              onMouseOver={(e) => (e.target.style.backgroundColor = saveBtnHoverStyle.backgroundColor)}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
              {loading ? "Saving..." : "Save / Update"}
            </button>
          </>
        ) : (
          <>
            <p style={profileTextStyle}><strong>Name:</strong> {user.name}</p>
            <p style={profileTextStyle}><strong>Email:</strong> {user.email}</p>
            <p style={profileTextStyle}><strong>Phone:</strong> {user.phone}</p>
            <p style={profileTextStyle}><strong>Role:</strong> {user.role}</p>

            <button
              style={editBtnStyle}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

