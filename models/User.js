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
        type: Schema.Types.ObjectId,
        ref: 'Item',  
    }],
    archievements: [{
        type: Schema.Types.ObjectId,
        ref: 'Archievement'
    }],
    tips: [{
        type: String,
    }]
});

module.exports = mongoose.model('User', UserSchema);
