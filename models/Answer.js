// const answers = [];

// module.exports = class Answer {
//     constructor(s) {
//         this.solution = s;
//     }

//     save() {
//         answers.push(this)
//     }

//     static fetchAll() {
//         return answers;
//     }
// }

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    question_id: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
    // question_id: String,
    // content: String,
});

module.exports = mongoose.model('Answer', answerSchema);