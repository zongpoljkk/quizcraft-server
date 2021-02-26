const mongoose = require("mongoose");
const { Schema } = mongoose;

const GroupSchema = new Schema({
  pin: {
    type: String,
    required: true,
    unique: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      _id: false,
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        require: true,
      },
      score: {
        type: Number,
        default: 0,
      },
      point: {
        type: Number,
        default: 0,
      },
      state: {
        type: String,
        enum: [
          "PROBLEM",
          "ANSWERED",
          "SHOW_ANSWER_CORRECT",
          "SHOW_ANSWER_WRONG",
        ],
        default: "PROBLEM",
      },
    },
  ],
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  subtopic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    required: true,
  },
  numberOfProblem: {
    type: Number,
    required: true,
    min: 1,
    max: 30,
  },
  timePerProblem: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  problems: [
    {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
  ],
  currentIndex: {
    type: Number,
    default: 0,
  },
  answersNumber: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "2d", //2 days
  },
  startCurrentProblemTime: {
    type: Date,
  }
});

module.exports = mongoose.model("Group", GroupSchema);
