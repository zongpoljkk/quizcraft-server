const answers = [];

module.exports = class Answer {
    constructor(s) {
        this.solution = s;
    }

    save() {
        answers.push(this)
    }

    static fetchAll() {
        return answers;
    }
}