const mongoose = require('mongoose');
const { Schema } = mongoose;

const HintSchema = new Schema({
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

module.exports = mongoose.model('Hint', HintSchema);
