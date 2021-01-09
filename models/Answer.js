const mongoose = require("mongoose");
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
  },
  checkAnswerType: {
    type: String,
    enum: ["MATH_EVALUATE","EQUAL_STRING","RULE_BASE"],
    default: "EQUAL_STRING",
  }
});

module.exports = mongoose.model("Answer", AnswerSchema);
