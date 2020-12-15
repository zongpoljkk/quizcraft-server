const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  school: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
  rank: {
    type: String,
    required: true,
    enum: ['BRONZE','SILVER','GOLD','DIAMOND'],
    default: 'BRONZE',
  },
  level: {
    type: Number,
    required: true,
    default: 1,
  },
  coin: {
    type: Number,
    required: true,
    default: 0,
  },
  photo: {
    type: String,
  },
  smartSchoolAccount: {
    type: String,
    required: true,
  },
  streak: {
    type: Number,
    required: true,
    default: 0,
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
  role: {
    type: String,
    required: true,
    enum: ['ADMIN','USER'],
    default: 'USER',
  },
  achievements: [{
    achievementID:{
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    score: {
      type: Number,
    }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
