const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
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

mongoose.model('answers', answerSchema);



const answersList = [];

module.exports = class Answer {
    constructor(s) {
        this.solution = s;
    }

    save() {
        answersList.push(this)
    }

    static fetchAll() {
        return answersList;
    }
}
