
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const CommunityEvent = require("./models/CommunityEvent");
const VolunteerRegistration = require("./models/VolunteerRegistration");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("NGO Volunteer Portal Backend is running");
});

// VOLUNTEER REGISTRATION
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "volunteer"
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      console.log("Login failed: user not found");
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      console.log("Login failed: password mismatch");
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    console.log("Login successful:", user.role);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Login failed due to server error"
    });
  }
});

// GET EVENTS
app.get("/events", async (req, res) => {
  try {
    const events = await CommunityEvent.find().sort({
      eventDate: 1
    });

    res.json(events);
  } catch (error) {
    console.error("Fetch events error:", error.message);
    res.status(500).json({
      message: "Failed to fetch events"
    });
  }
});

// CREATE EVENT
app.post("/events", async (req, res) => {
  try {
    const {
      eventTitle,
      eventCategory,
      eventDate,
      venue,
      organizer,
      maximumVolunteers
    } = req.body;

    if (
      !eventTitle ||
      !eventCategory ||
      !eventDate ||
      !venue ||
      !organizer ||
      maximumVolunteers == null ||
      !Number.isInteger(Number(maximumVolunteers)) ||
      Number(maximumVolunteers) < 1
    ) {
      return res.status(400).json({
        message: "Please enter valid event details"
      });
    }

    const event = await CommunityEvent.create({
      eventTitle,
      eventCategory,
      eventDate,
      venue,
      organizer,
      maximumVolunteers: Number(maximumVolunteers)
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error("Create event error:", error.message);
    res.status(500).json({
      message: "Failed to create event"
    });
  }
});

// DELETE EVENT
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const event = await CommunityEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    await VolunteerRegistration.deleteMany({
      eventId: event._id
    });

    res.json({
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Delete event error:", error.message);
    res.status(500).json({
      message: "Failed to delete event"
    });
  }
});

// REGISTER FOR EVENT
app.post("/register-event", async (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;

    if (
      !mongoose.isValidObjectId(volunteerId) ||
      !mongoose.isValidObjectId(eventId)
    ) {
      return res.status(400).json({
        message: "Invalid volunteer ID or event ID"
      });
    }

    const volunteer = await User.findOne({
      _id: volunteerId,
      role: "volunteer"
    });

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found"
      });
    }

    const event = await CommunityEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const existing = await VolunteerRegistration.findOne({
      volunteerId,
      eventId
    });

    if (existing) {
      return res.status(409).json({
        message: "Already registered for this event"
      });
    }

    const count = await VolunteerRegistration.countDocuments({
      eventId
    });

    if (count >= event.maximumVolunteers) {
      return res.status(400).json({
        message: "This event has reached its volunteer limit"
      });
    }

    const registration = await VolunteerRegistration.create({
      volunteerId,
      eventId,
      participationStatus: "Registered"
    });

    res.status(201).json({
      message: "Successfully registered for event",
      registration
    });
  } catch (error) {
    console.error("Event registration error:", error.message);
    res.status(500).json({
      message: "Event registration failed"
    });
  }
});

// GET ALL REGISTRATIONS
app.get("/registrations", async (req, res) => {
  try {
    const registrations = await VolunteerRegistration.find()
      .populate("volunteerId", "name email")
      .populate("eventId");

    res.json(registrations);
  } catch (error) {
    console.error("Fetch registrations error:", error.message);
    res.status(500).json({
      message: "Failed to load registrations"
    });
  }
});

// VOLUNTEER PARTICIPATION HISTORY
app.get("/my-registrations/:volunteerId", async (req, res) => {
  try {
    const { volunteerId } = req.params;

    if (!mongoose.isValidObjectId(volunteerId)) {
      return res.status(400).json({
        message: "Invalid volunteer ID"
      });
    }

    const registrations = await VolunteerRegistration.find({
      volunteerId
    }).populate("eventId");

    res.json(registrations);
  } catch (error) {
    console.error("Participation history error:", error.message);
    res.status(500).json({
      message: "Failed to fetch participation history"
    });
  }
});

// CONFIGURE DEFAULT ADMIN
async function createDefaultAdmin() {
  const email = "admin@careconnect.com";
  const password = "admin123";

  let admin = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!admin) {
    admin = new User({
      name: "CareConnect Admin",
      email,
      password: hashedPassword,
      role: "admin"
    });
  } else {
    admin.name = "CareConnect Admin";
    admin.password = hashedPassword;
    admin.role = "admin";
  }

  await admin.save();

  console.log("Default admin credentials configured");
}

// START SERVER
async function startServer() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || !mongoURI.trim()) {
    console.error("MONGODB_URI is missing in server/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");

    await createDefaultAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
