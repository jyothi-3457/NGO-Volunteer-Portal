const mongoose = require("mongoose");

const volunteerRegistrationSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityEvent",
      required: true
    },

    registrationDate: {
      type: Date,
      default: Date.now
    },

    participationStatus: {
      type: String,
      default: "Registered"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "VolunteerRegistration",
  volunteerRegistrationSchema
);