const mongoose = require('mongoose');
const { Schema } = mongoose;

const AchievementSchema = new Schema({
    rewardCoin: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['STREAKS','QUESTIONS','OTHER'],
    },
    name: {
        type: String,
        required: true,
    },
    progress: {
        type: Number,
        required: true,
    },
    goal: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model('Achievement', AchievementSchema);
