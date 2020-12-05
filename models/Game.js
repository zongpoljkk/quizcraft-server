const mongoose = require('mongoose');
const { Schema } = mongoose;

const GameSchema = new Schema({
    mode: {
        type: String,
        required: true,
        enum: ['PRACTICE','QUIZ','CHALLENGE'],
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    usedHint: {
        type: Boolean,
        required: true,
        default: false,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subtopicId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    subtopicName: {
        type: String,
        required: true,
    },
    time: {
        type: Schema.Types.Decimal128,
        required: true,
        default: 0,
    }  
})

module.exports = mongoose.model('Game', GameSchema);
