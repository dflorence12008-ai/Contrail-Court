const mongoose = require("mongoose");

// ================= USER =================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "investigator"],
      default: "investigator"
    }
  },
  {
    timestamps: true
  }
);

// ================= INVESTIGATION =================

const investigationSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    investigator: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Under Investigation",
        "Evidence Review",
        "Completed",
        "Resolved"
      ],
      default: "Under Investigation"
    },

    flightNumber: {
      type: String,
      required: true
    },

    airline: {
      type: String,
      required: true
    },

    origin: {
      type: String,
      required: true
    },

    destination: {
      type: String,
      required: true
    },

    flightDate: {
      type: Date,
      required: true
    },

    altitude: {
      type: Number,
      required: true
    },

    flightDuration: {
      type: Number,
      required: true
    },

    flightPath: {
      type: String,
      default: ""
    },

    atmosphericConditions: {
      temperature: {
        type: Number,
        required: true
      },

      humidity: {
        type: Number,
        required: true
      },

      pressure: {
        type: Number,
        required: true
      },

      windSpeed: {
        type: Number,
        required: true
      },

      cloudCover: {
        type: Number,
        default: 0
      }
    },

    contrailObservation: {
      observed: {
        type: Boolean,
        default: false
      },

      type: {
        type: String,
        default: ""
      },

      persistence: {
        type: String,
        default: ""
      },

      details: {
        type: String,
        default: ""
      }
    },

    evidence: {
      description: {
        type: String,
        default: ""
      },

      imageUrl: {
        type: String,
        default: ""
      },

      available: {
        type: Boolean,
        default: false
      }
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },

    riskScore: {
      type: Number,
      default: 0
    },

    findings: {
      type: String,
      default: ""
    },

    investigationResult: {
      type: String,
      default: ""
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
const Investigation = mongoose.model(
  "Investigation",
  investigationSchema
);

module.exports = {
  User,
  Investigation
};