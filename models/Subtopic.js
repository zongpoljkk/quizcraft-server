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
  topic: {
    type: String,
    required: true,
  },
})


module.exports = mongoose.model('Subtopic', SubtopicSchema);
