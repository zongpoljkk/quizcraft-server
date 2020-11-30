const mongoose = require('mongoose');
const { Schema } = mongoose;

const GameSchema = new Schema({
    mode: {
        type: String,
        required: true,
        enum: ['PRACTICE','QUIZ','CHALLENGE'],
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'questions',
        required: true,
    },
    usedHint: {
        type: Boolean,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'subjects',
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    subtopic: {
        type: String,
        required: true,
    },
    time: {
        type: Schema.Types.Decimal128,
        required: true,
    }  
})

module.exports = mongoose.model('Game', GameSchema);
