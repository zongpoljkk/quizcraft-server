
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
    pinCode: {
        type: String,
        required: true,
    },
    groupCapacity: {
        type: Number,
        required: true,
    }, 
    subtopicId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    }],
})

module.exports = mongoose.model('Group', GroupSchema);
