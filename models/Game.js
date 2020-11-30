const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
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
    subtopic: {
        type: Number,
        required: true,
    },
    time: {
        type: Float32Array,
        required: true,
    }  
})

mongoose.model('games', gameSchema);
