const { null } = require("mathjs");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const AchievementSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  rewardEXP: {
    type: Number,
    required: true,
  },
  rewardCoin: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["STREAKS", "QUESTIONS", "OTHER"],
  },
  image: {
    type: String,
    default: null,
  },
  lottie: {
    type: Object,
    default: null,
  },
});

module.exports = mongoose.model("Achievement", AchievementSchema);
