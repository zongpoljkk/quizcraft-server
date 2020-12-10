const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true
  },
  school: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  rank: {
    type: String,
    required: true,
    enum: ['BRONZE','SILVER','GOLD','DIAMOND'],
  },
  level: {
    type: Number,
    required: true,
  },
  coin: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
  },
  smartSchoolAccount: {
    type: String,
  },
  streak: {
    type: Number,
    required: true,
  },
  items: [{
    itemID: {
      type: Schema.Types.ObjectId,
      ref: 'Item'
    },
    amount: {
      type: Number,
    }
  }],
  achievements: [{
    achievementID:{
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    score: {
      type: Number,
    }
  }]
});

module.exports = mongoose.model('User', UserSchema);
