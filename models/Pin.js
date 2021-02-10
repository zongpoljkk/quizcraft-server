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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800, //2 days 
  }
})

module.exports = mongoose.model('Pin', PinSchema);