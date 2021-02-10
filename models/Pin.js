const mongoose = require('mongoose');
const { Schema } = mongoose;

const PinSchema = new Schema({
  prefix: {
    type: String,
    unique: true,
  },
  count: {
    type: Number,
    default: 1,
  }
})

module.exports = mongoose.model('Pin', PinSchema);