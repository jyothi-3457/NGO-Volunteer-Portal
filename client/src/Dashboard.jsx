import { useEffect, useState } from "react";
import axios from "axios";
import MyParticipation from "./MyParticipation";
import Profile from "./Profile";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [showParticipation, setShowParticipation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchRegistrationCounts();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/events"
      );

      setEvents(response.data);
    } catch (error) {
      alert("Failed to load events");
    }
  };

  const fetchRegistrationCounts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/registrations"
      );

      const registrations = response.data;

      const counts = {};

      registrations.forEach((registration) => {
        const eventId =
          registration.eventId?._id ||
          registration.eventId;

        if (eventId) {
          counts[eventId] =
            (counts[eventId] || 0) + 1;
        }
      });

      setRegistrationCounts(counts);

      const volunteerId =
        localStorage.getItem("userId");

      if (volunteerId) {
        const myRegistrations =
          registrations.filter(
            (registration) =>
              registration.volunteerId?._id ===
              volunteerId ||
              registration.volunteerId ===
              volunteerId
          );

        setRegisteredEvents(
          myRegistrations
            .map((registration) =>
              registration.eventId?._id ||
              registration.eventId
            )
            .filter(Boolean)
        );
      }

    } catch (error) {
      console.log(
        "Failed to load registration counts"
      );
    }
  };

  const registerForEvent = async (eventId) => {
    const volunteerId =
      localStorage.getItem("userId");

    if (!volunteerId) {
      alert("Please login again");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/register-event",
        {
          volunteerId,
          eventId
        }
      );

      alert(response.data.message);

      setRegisteredEvents((previous) => [
        ...previous,
        eventId
      ]);

      setRegistrationCounts((previous) => ({
        ...previous,
        [eventId]:
          (previous[eventId] || 0) + 1
      }));

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Event registration failed"
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (showProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f7f4ec, #eef5ee)",
          padding: "30px"
        }}
      >
        <button
          onClick={() => setShowProfile(false)}
          style={{
            padding: "11px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#2f6b4f",
            color: "white",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          ← Back to Dashboard
        </button>

        <Profile />
      </div>
    );
  }

  if (showParticipation) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f7f4ec, #eef5ee)",
          padding: "30px"
        }}
      >
        <button
          onClick={() =>
            setShowParticipation(false)
          }
          style={{
            padding: "11px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#2f6b4f",
            color: "white",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          ← Back to Dashboard
        </button>

        <MyParticipation />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f4ec, #eef5ee)",
        padding: "35px"
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >

        <div
          style={{
            background:
              "linear-gradient(135deg, #1f5139, #356f50)",
            color: "white",
            padding: "30px",
            borderRadius: "18px",
            boxShadow:
              "0 12px 30px rgba(31,81,57,0.20)",
            marginBottom: "30px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: "34px"
                }}
              >
                Volunteer Dashboard
              </h1>

              <p
                style={{
                  margin: 0,
                  opacity: 0.9,
                  fontSize: "16px"
                }}
              >
                Welcome to the NGO Volunteer Portal
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "#d64b4b",
                color: "white",
                padding: "11px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "35px"
          }}
        >
          <button
            onClick={() => setShowProfile(true)}
            style={{
              padding: "13px 22px",
              border: "none",
              borderRadius: "9px",
              background: "#ffffff",
              color: "#2f6b4f",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow:
                "0 5px 18px rgba(40,70,50,0.10)"
            }}
          >
            👤 My Profile
          </button>

          <button
            onClick={() =>
              setShowParticipation(true)
            }
            style={{
              padding: "13px 22px",
              border: "none",
              borderRadius: "9px",
              background: "#ffffff",
              color: "#2f6b4f",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow:
                "0 5px 18px rgba(40,70,50,0.10)"
            }}
          >
            📋 My Participation
          </button>
        </div>

        <div>
          <h2
            style={{
              color: "#214d37",
              marginBottom: "20px",
              fontSize: "27px"
            }}
          >
            Community Events
          </h2>

          {events.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "14px",
                textAlign: "center",
                boxShadow:
                  "0 5px 20px rgba(40,70,50,0.08)"
              }}
            >
              <p>
                No community events available.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "22px"
              }}
            >
              {events.map((event) => {
                const registeredCount =
                  registrationCounts[event._id] || 0;

                const maximumVolunteers =
                  Number(event.maximumVolunteers) || 0;

                const remainingVolunteers =
                  Math.max(
                    maximumVolunteers -
                    registeredCount,
                    0
                  );

                const isRegistered =
                  registeredEvents.includes(
                    event._id
                  );

                const isFull =
                  remainingVolunteers === 0;

                return (
                  <div
                    key={event._id}
                    style={{
                      background:
                        "rgba(255,255,255,0.95)",
                      borderRadius: "16px",
                      padding: "25px",
                      boxShadow:
                        "0 8px 25px rgba(40,70,50,0.10)",
                      border:
                        "1px solid rgba(47,107,79,0.10)",
                      transition: "0.25s"
                    }}
                  >

                    <div
                      style={{
                        display: "inline-block",
                        background: "#e5f0e7",
                        color: "#2f6b4f",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "12px"
                      }}
                    >
                      {event.eventCategory}
                    </div>

                    <h3
                      style={{
                        color: "#214d37",
                        fontSize: "22px",
                        margin:
                          "5px 0 18px"
                      }}
                    >
                      {event.eventTitle}
                    </h3>

                    <p>
                      <strong>📅 Date:</strong>{" "}
                      {new Date(
                        event.eventDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>📍 Venue:</strong>{" "}
                      {event.venue}
                    </p>

                    <p>
                      <strong>👥 Organizer:</strong>{" "}
                      {event.organizer}
                    </p>

                    <p>
                      <strong>🙋 Volunteers Needed:</strong>{" "}
                      {maximumVolunteers}
                    </p>

                    <div
                      style={{
                        marginTop: "18px",
                        padding: "13px 15px",
                        borderRadius: "10px",
                        background: isFull
                          ? "#f8e5e5"
                          : "#edf6ef",
                        color: isFull
                          ? "#b33a3a"
                          : "#2f6b4f",
                        fontWeight: "600",
                        fontSize: "14px"
                      }}
                    >
                      {isFull ? (
                        <>
                          ✓ {registeredCount} volunteers
                          registered
                          <br />
                          <span
                            style={{
                              display: "block",
                              marginTop: "5px"
                            }}
                          >
                            Registration Full
                          </span>
                        </>
                      ) : (
                        <>
                          {registeredCount}{" "}
                          {registeredCount === 1
                            ? "volunteer"
                            : "volunteers"}{" "}
                          registered
                          <br />
                          <span
                            style={{
                              display: "block",
                              marginTop: "5px"
                            }}
                          >
                            {remainingVolunteers} more{" "}
                            {remainingVolunteers === 1
                              ? "volunteer"
                              : "volunteers"}{" "}
                            needed
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        registerForEvent(event._id)
                      }
                      disabled={
                        isRegistered || isFull
                      }
                      style={{
                        width: "100%",
                        marginTop: "12px",
                        padding: "12px",
                        border: "none",
                        borderRadius: "9px",
                        background:
                          isRegistered || isFull
                            ? "#8fa99a"
                            : "#2f6b4f",
                        color: "white",
                        fontWeight: "600",
                        cursor:
                          isRegistered || isFull
                            ? "default"
                            : "pointer"
                      }}
                    >
                      {isRegistered
                        ? "✓ Registered"
                        : isFull
                        ? "Registration Full"
                        : "Register for Event"}
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;