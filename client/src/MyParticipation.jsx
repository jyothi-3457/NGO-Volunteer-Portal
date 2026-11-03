
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MyParticipation() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipation();
  }, []);

  const fetchParticipation = async () => {
    const volunteerId = localStorage.getItem("userId");

    if (!volunteerId) {
      alert("Please login again");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/my-registrations/${volunteerId}`
      );
      setRegistrations(response.data);
    } catch (error) {
      console.error("Participation Error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        "Failed to load participation history"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>My Participation</h1>
      <p>View the community events you have registered for.</p>

      {loading ? (
        <p>Loading participation history...</p>
      ) : registrations.length === 0 ? (
        <p>You have not registered for any events yet.</p>
      ) : (
        registrations.map((registration) => (
          <div
            key={registration._id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              margin: "15px 0",
              borderRadius: "10px"
            }}
          >
            <h2>{registration.eventId?.eventTitle || "Event"}</h2>
            <p><strong>Category:</strong> {registration.eventId?.eventCategory}</p>
            <p>
              <strong>Date:</strong>{" "}
              {registration.eventId?.eventDate
                ? new Date(registration.eventId.eventDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p><strong>Venue:</strong> {registration.eventId?.venue || "N/A"}</p>
            <p><strong>Organizer:</strong> {registration.eventId?.organizer || "N/A"}</p>
            <p>
              <strong>Registration Date:</strong>{" "}
              {registration.registrationDate
                ? new Date(registration.registrationDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Participation Status:</strong>{" "}
              {registration.participationStatus}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyParticipation;
