const mongoose = require("mongoose");

const communityEventSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      required: true
    },
    eventCategory: {
      type: String,
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    organizer: {
      type: String,
      required: true
    },
    maximumVolunteers: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "CommunityEvent",
  communityEventSchema
);