const mongoose = require('mongoose');
const { Schema } = mongoose;

const CounterSchema = new Schema({
  field: {
    type: String,
    required: true,
  }, 
  sequenceValue: {
    type: Number,
    required: true,
    default: 1,
  }
})

module.exports = mongoose.model('Counter', CounterSchema);
