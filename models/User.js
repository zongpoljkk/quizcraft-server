const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  password: {
    type: String,
    select: false,
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
  },
  streak: {
    type: Number,
    required: true,
    default: 0,
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item',  
  }],
  archievements: [{
    type: Schema.Types.ObjectId,
    ref: 'Archievement'
  }],
  tips: [{
    type: String,
  }],
  role: {
    type: String,
    required: true,
    enum: ['ADMIN','USER'],
    default: 'USER',
  }
});

module.exports = mongoose.model('User', UserSchema);
