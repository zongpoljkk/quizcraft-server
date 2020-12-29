const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChallengeSchema = new Schema({
  user1Id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user2Id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  whoTurn: {
    type: Number,
    required: true,
    enum: [1,2],
    default: 1,
  },
  problems: [{
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  }],
  user1Score: {
    type: Number,
    required: true,
    default: 0,
  },
  user2Score: {
    type: Number,
    required: true,
    default: 0,
  },
  user1Time: {
    type: Schema.Types.Decimal128,
    required: true,
    default: 0,
  },
  user2Time: {
    type: Schema.Types.Decimal128,
    required: true,
    default: 0,
  },
  currentProblem: {
    type: Number,
    required: true,
    enum: [0,1,2,3,4],
    default: 0,
  },
  subtopicName: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    required: true,
  },
  user1Result: [{
    type: Number,
  }],
  user2Result: [{
    type: Number,
  }],
  user1IsRead: {
    type: Boolean,
    default: false,
  },
  user2IsRead: {
    type: Boolean,
    default: false,
  }
})

module.exports = mongoose.model('Challenge', ChallengeSchema);
