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
    type: Object,
    default: null,
  },
  topic: {
    type: String,
    required: true,
  },
  topicImg: {
    type: Object,
    default: null,
  },
  availableDifficulty: [{
    _id: false,
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
