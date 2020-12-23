const mongoose = require('mongoose');
const { Schema } = mongoose;

const HintSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  }, 
  body: {
    type: String,
  }
})

module.exports = mongoose.model('Hint', HintSchema);
