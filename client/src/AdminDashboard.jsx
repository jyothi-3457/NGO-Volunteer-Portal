
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("Overview");
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    eventTitle: "",
    eventCategory: "",
    eventDate: "",
    venue: "",
    organizer: "",
    maximumVolunteers: ""
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventResponse, registrationResponse] = await Promise.all([
        axios.get(`${API}/events`),
        axios.get(`${API}/registrations`)
      ]);

      setEvents(Array.isArray(eventResponse.data) ? eventResponse.data : []);
      setRegistrations(
        Array.isArray(registrationResponse.data)
          ? registrationResponse.data
          : []
      );
      setMessage("");
    } catch (error) {
      setMessage("Unable to load data. Check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEventId = (registration) => {
    return registration.eventId?._id || registration.eventId;
  };

  const getRegisteredCount = (eventId) => {
    return registrations.filter(
      (registration) => String(getEventId(registration)) === String(eventId)
    ).length;
  };

  const getRemaining = (event) => {
    const maximum = Number(event.maximumVolunteers || 0);
    return Math.max(maximum - getRegisteredCount(event._id), 0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/events`, {
        ...form,
        maximumVolunteers: Number(form.maximumVolunteers)
      });

      setForm({
        eventTitle: "",
        eventCategory: "",
        eventDate: "",
        venue: "",
        organizer: "",
        maximumVolunteers: ""
      });

      setMessage("Event created successfully.");
      setActivePage("Community Events");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create event.");
    }
  };

  const deleteEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API}/events/${eventId}`);
      setMessage("Event deleted successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete event.");
    }
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const navigation = [
    { name: "Overview", icon: "⌂" },
    { name: "Community Events", icon: "▦" },
    { name: "Volunteers", icon: "♧" },
    { name: "Add Event", icon: "+" }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">🌿</div>
          <div>
            <h2>CareConnect</h2>
            <p>NGO Volunteer Portal</p>
          </div>
        </div>

        <div className="admin-menu-label">MAIN MENU</div>

        <nav className="admin-navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`admin-nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => {
                setActivePage(item.name);
                setMessage("");
              }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-help-card">
            <span>🌱</span>
            <h3>Small actions.</h3>
            <h3>Big impact.</h3>
            <p>Every volunteer makes a difference.</p>
          </div>

          <button className="admin-logout" onClick={logout}>
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">CareConnect / Admin</p>
            <h2>{activePage}</h2>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status">
              <span className="admin-status-dot"></span>
              Administrator
            </div>
            <button
              className="admin-refresh-button"
              onClick={loadData}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        {message && (
          <div className="admin-message">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {loading && <p className="admin-loading">Loading project data...</p>}

        {!loading && activePage === "Overview" && (
          <>
            <section className="admin-welcome">
              <div>
                <span className="admin-eyebrow">MAKE A DIFFERENCE TODAY</span>
                <h1>Welcome to your dashboard 👋</h1>
                <p>
                  Manage community events and help bring volunteers
                  together for meaningful change.
                </p>
                <button
                  className="admin-primary-button"
                  onClick={() => setActivePage("Add Event")}
                >
                  + Create New Event
                </button>
              </div>
              <div className="admin-welcome-art">🌳</div>
            </section>

            <section className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon green">▦</div>
                <p>Total Events</p>
                <h2>{events.length}</h2>
                <span>Community activities</span>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon yellow">♧</div>
                <p>Total Registrations</p>
                <h2>{registrations.length}</h2>
                <span>Volunteer sign-ups</span>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon peach">♡</div>
                <p>Volunteer Places</p>
                <h2>
                  {events.reduce(
                    (total, event) =>
                      total + Number(event.maximumVolunteers || 0),
                    0
                  )}
                </h2>
                <span>Total event capacity</span>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon blue">✓</div>
                <p>Places Remaining</p>
                <h2>{events.reduce((total, event) => total + getRemaining(event), 0)}</h2>
                <span>Volunteers still needed</span>
              </div>
            </section>

            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2>Recent Community Events</h2>
                  <p>Review your latest activities and volunteer needs.</p>
                </div>
                <button
                  className="admin-text-button"
                  onClick={() => setActivePage("Community Events")}
                >
                  View all →
                </button>
              </div>

              {events.length === 0 ? (
                <div className="admin-empty">
                  <span>🌱</span>
                  <h3>No events created yet</h3>
                  <p>Create your first event to get started.</p>
                </div>
              ) : (
                <div className="admin-event-grid">
                  {events.slice(0, 3).map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      count={getRegisteredCount(event._id)}
                      remaining={getRemaining(event)}
                      onDelete={deleteEvent}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2>Recent Registrations</h2>
                  <p>Volunteers who have signed up for events.</p>
                </div>
                <button
                  className="admin-text-button"
                  onClick={() => setActivePage("Volunteers")}
                >
                  View all →
                </button>
              </div>
              <RegistrationTable registrations={registrations.slice(0, 5)} />
            </section>
          </>
        )}

        {!loading && activePage === "Community Events" && (
          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Community Events</h2>
                <p>Manage activities and monitor volunteer requirements.</p>
              </div>
              <button
                className="admin-primary-button"
                onClick={() => setActivePage("Add Event")}
              >
                + Add Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="admin-empty">
                <span>🌿</span>
                <h3>No events available</h3>
                <p>Add an event to see it here.</p>
              </div>
            ) : (
              <div className="admin-event-grid">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    count={getRegisteredCount(event._id)}
                    remaining={getRemaining(event)}
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!loading && activePage === "Volunteers" && (
          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Volunteer Registrations</h2>
                <p>View the volunteers registered for community events.</p>
              </div>
              <span className="admin-count-badge">
                {registrations.length} registrations
              </span>
            </div>
            <RegistrationTable registrations={registrations} />
          </section>
        )}

        {activePage === "Add Event" && (
          <section className="admin-form-section">
            <div className="admin-section-heading">
              <div>
                <h2>Create a Community Event</h2>
                <p>Enter the details of the activity you are organizing.</p>
              </div>
            </div>

            <form className="admin-event-form" onSubmit={createEvent}>
              <div className="admin-form-grid">
                <label>
                  Event Title
                  <input
                    name="eventTitle"
                    value={form.eventTitle}
                    onChange={handleChange}
                    placeholder="e.g. Tree Plantation Drive"
                    required
                  />
                </label>

                <label>
                  Event Category
                  <select
                    name="eventCategory"
                    value={form.eventCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Environment">Environment</option>
                    <option value="Food Distribution">Food Distribution</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Blood Donation">Blood Donation</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Event Date
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Venue
                  <input
                    name="venue"
                    value={form.venue}
                    onChange={handleChange}
                    placeholder="Enter event location"
                    required
                  />
                </label>

                <label>
                  Organizer
                  <input
                    name="organizer"
                    value={form.organizer}
                    onChange={handleChange}
                    placeholder="NGO or organizer name"
                    required
                  />
                </label>

                <label>
                  Maximum Volunteers
                  <input
                    type="number"
                    name="maximumVolunteers"
                    value={form.maximumVolunteers}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 20"
                    required
                  />
                </label>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setActivePage("Community Events")}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-primary-button">
                  Save Event
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function EventCard({ event, count, remaining, onDelete }) {
  return (
    <article className="admin-event-card">
      <div className="admin-event-card-top">
        <span className="admin-category">
          {event.eventCategory || "Community"}
        </span>
        <span className="admin-event-leaf">🌿</span>
      </div>

      <h3>{event.eventTitle || "Community Event"}</h3>

      <div className="admin-event-detail">
        <span>▣</span>
        {event.eventDate
          ? new Date(event.eventDate).toLocaleDateString()
          : "Date not specified"}
      </div>

      <div className="admin-event-detail">
        <span>⌖</span>
        {event.venue || "Venue not specified"}
      </div>

      <div className="admin-event-detail">
        <span>♧</span>
        {event.organizer || "Organizer not specified"}
      </div>

      <div className="admin-capacity-box">
        <div>
          <span>Volunteers registered</span>
          <strong>{count} / {Number(event.maximumVolunteers || 0)}</strong>
        </div>
        <p>
          {remaining > 0
            ? `${remaining} more volunteers needed`
            : "Volunteer capacity reached"}
        </p>
      </div>

      <button
        className="admin-delete-button"
        onClick={() => onDelete(event._id)}
      >
        Delete Event
      </button>
    </article>
  );
}

function RegistrationTable({ registrations }) {
  if (registrations.length === 0) {
    return (
      <div className="admin-empty">
        <span>♧</span>
        <h3>No registrations yet</h3>
        <p>Volunteer registrations will appear here.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Volunteer</th>
            <th>Email</th>
            <th>Event</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration, index) => {
            const volunteer =
              registration.volunteerId &&
              typeof registration.volunteerId === "object"
                ? registration.volunteerId
                : {};

            const event =
              registration.eventId &&
              typeof registration.eventId === "object"
                ? registration.eventId
                : {};

            return (
              <tr key={registration._id || index}>
                <td>
                  <div className="admin-volunteer-name">
                    <span className="admin-avatar">
                      {(volunteer.name || "V").charAt(0).toUpperCase()}
                    </span>
                    {volunteer.name || "Volunteer"}
                  </div>
                </td>
                <td>{volunteer.email || "Not available"}</td>
                <td>{event.eventTitle || "Event registration"}</td>
                <td>
                  <span className="admin-registration-status">
                    {registration.participationStatus || "Registered"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
