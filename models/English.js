const mongoose = require('mongoose');
const { Schema } = mongoose;

const EnglishSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["SENTENCE","WORD"]
  }, 
  sentence: {
    type: String,
  },
  words: [{
    type: String,
  }]
})

module.exports = mongoose.model('English', EnglishSchema);
