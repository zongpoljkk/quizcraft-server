const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProblemSchema = new Schema({
    body: {
        type: String,
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
    difficulty: {
        type: String,
        enum: ['EASY','MEDIUM','HARD'],
        required: true,
    },
    avgTime: {
        type: Schema.Types.Decimal128,
        required: true,
        default: 0,
    }
})

module.exports = mongoose.model('Problem', ProblemSchema);
