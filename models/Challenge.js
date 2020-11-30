const mongoose = require('mongoose');
const { Schema } = mongoose;

const challengeSchema = new Schema({
    user1Id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    user2Id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    whoTurn: {
        type: Number,
        required: true,
        enum: [1,2],
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'questions',
        required: true,
    }],
    user1Score: {
        type: Number,
        required: true,
    },
    user2Score: {
        type: Number,
        required: true,
    },
    currentQuestion: {
        type: Number,
        required: true,
        enum: [1,2,3,4,5],
    }
})

mongoose.model('challenges', challengeSchema);
