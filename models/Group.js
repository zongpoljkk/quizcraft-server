
const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupSchema = new Schema({
    pinCode: {
        type: String,
        required: true,
    },
    groupCapacity: {
        type: Number,
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
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    }],
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'questions',
        required: true,
    }],
})

mongoose.model('groups', groupSchema);
