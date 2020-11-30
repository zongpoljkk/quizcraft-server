const mongoose = require('mongoose');
const { Schema } = mongoose;

const achievementSchema = new Schema({
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

mongoose.model('achievements', achievementSchema);
