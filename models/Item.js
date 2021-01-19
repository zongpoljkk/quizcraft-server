const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: Object,
    default: null,
  },
  lottie: {
    type: Object,
    default: null,
  }
})

module.exports = mongoose.model('Item', ItemSchema);
