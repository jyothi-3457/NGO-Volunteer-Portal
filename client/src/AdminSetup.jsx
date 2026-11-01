import { useState } from "react";
import axios from "axios";

function AdminSetup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createAdmin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/create-admin",
        {
          name,
          email,
          password
        }
      );

      alert(response.data.message);

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create admin"
      );
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Admin</h1>

      <input
        type="text"
        placeholder="Admin Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Admin Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={createAdmin}>
        Create Admin
      </button>
    </div>
  );
}

export default AdminSetup;