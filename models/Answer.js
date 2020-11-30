const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnswerSchema = new Schema({
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'questions',
        required: true,
    }, 
    body: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Answer', AnswerSchema);