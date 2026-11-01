
import { useState } from "react";
import axios from "axios";
import "./App.css";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      alert(response.data.message);

      setName("");
      setEmail("");
      setPassword("");
      setShowRegister(false);
      setShowLogin(true);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Registration failed. Check whether the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password
      });

      const user = response.data.user;

      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);

      setUserRole(user.role);
      setEmail("");
      setPassword("");
      setLoggedIn(true);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login failed. Check server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return userRole === "admin"
      ? <AdminDashboard />
      : <Dashboard />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>NGO Volunteer Portal</h2>

        <div>
          <button onClick={() => {
            setShowLogin(true);
            setShowRegister(false);
          }}>
            Login
          </button>

          <button onClick={() => {
            setShowRegister(true);
            setShowLogin(false);
          }}>
            Register
          </button>
        </div>
      </nav>

      <main className="hero">
        {!showLogin && !showRegister && (
          <>
            <h1>Make a Difference</h1>
            <p>
              Join our NGO volunteer community and participate
              in meaningful community service events.
            </p>
            <button onClick={() => {
              setShowRegister(true);
              setShowLogin(false);
            }}>
              Become a Volunteer
            </button>
          </>
        )}

        {showLogin && (
          <div className="form-box">
            <h2>Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>

            <p onClick={() => {
              setShowRegister(true);
              setShowLogin(false);
            }}>
              New volunteer? Register
            </p>
          </div>
        )}

        {showRegister && (
          <div className="form-box">
            <h2>Volunteer Registration</h2>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleRegister} disabled={loading}>
              {loading ? "Please wait..." : "Register"}
            </button>

            <p onClick={() => {
              setShowLogin(true);
              setShowRegister(false);
            }}>
              Already registered? Login
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
