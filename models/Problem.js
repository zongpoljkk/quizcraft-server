const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProblemSchema = new Schema({
    body: {
        type: String,
        required: true,
    },
    // subjectId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'subjects',
    //     required: true,
    // },
    topic: {
        type: String,
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
    difficulty: {
        type: String,
        enum: ['EASY','MEDIUM','HARD'],
        required: true,
    },
    avgTime: {
        type: Schema.Types.Decimal128,
        required: true,
    }
})

module.exports = mongoose.model('Problem', ProblemSchema);
