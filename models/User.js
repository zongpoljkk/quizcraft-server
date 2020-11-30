const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
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
        ref: 'items',  
    }],
    archievements: [{
        type: Schema.Types.ObjectId,
        ref: 'archievements'
    }],
    tips: [{
        type: String,
    }]
});

mongoose.model('users', userSchema);
