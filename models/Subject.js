const mongoose = require('mongoose');
const { Schema } = mongoose;

const subjectSchema = new Schema({
    subjectName: {
        type: String,
        required: true,
    },
    topics: [{
        type: String,
        required: true,
    }]
})


mongoose.model('subjects', subjectSchema);
