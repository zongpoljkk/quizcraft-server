const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  school: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
  rank: {
    type: String,
    enum: ["BRONZE", "SILVER", "GOLD"],
    default: "BRONZE",
  },
  level: {
    type: Number,
    default: 1,
  },
  exp: {
    type: Number,
    default: 0,
  },
  maxExp: {
    type: Number,
    default: 100,
  },
  coin: {
    type: Number,
    default: 0,
  },
  photo: {
    type: Object,
    default: null,
  },
  smartSchoolAccount: {
    type: String,
    required: true,
  },
  streak: {
    type: Number,
    default: 0,
  },
  items: [
    {
      itemName: {
        type: String,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
  ],
  achievements: [
    {
      achievementName: {
        type: String,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
  ],
  role: {
    type: String,
    enum: ["ADMIN", "USER"],
    default: "USER",
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
