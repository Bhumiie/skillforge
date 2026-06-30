import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    organizer: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    technologies: [
      {
        type: String,
      },
    ],

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },

    location: {
      type: String,
      default: "",
    },

    registrationDeadline: Date,

    startDate: Date,

    endDate: Date,

    teamSize: {
      type: Number,
      default: 4,
    },

    maxTeams: {
      type: Number,
      default: 100,
    },

    prizePool: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Hackathon", hackathonSchema);