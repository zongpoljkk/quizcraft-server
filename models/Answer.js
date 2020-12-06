const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  }, 
  body: {
    type: String,
    required: true,
  }
})

module.exports = mongoose.model('Answer', AnswerSchema);