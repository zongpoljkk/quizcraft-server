const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubtopicSchema = new Schema({
  subtopicName: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true,
  },
  subjectImg: {
    type: String,
    default: null,
  },
  topic: {
    type: String,
    required: true,
  },
  topicImg: {
    type: String,
    default: null,
  },
  availableDifficulty: [{
    difficulty: {
      type: String,
      enum: ["EASY","MEDIUM","HARD"]
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  }]
})


module.exports = mongoose.model('Subtopic', SubtopicSchema);
