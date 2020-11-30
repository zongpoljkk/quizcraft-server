const mongoose = require('mongoose');
const { Schema } = mongoose;

const hintSchema = new Schema({
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

mongoose.model('hints', hintSchema);
