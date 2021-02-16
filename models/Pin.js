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
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    expires: '1d', //1 day 
  }
})

module.exports = mongoose.model('Pin', PinSchema);