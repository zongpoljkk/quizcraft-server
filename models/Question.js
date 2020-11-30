const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    body: {
        type: String,
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

mongoose.model('questions', questionSchema);
