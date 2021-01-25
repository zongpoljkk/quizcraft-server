const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProblemSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  subtopicName: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    required: true,
  },
  times: [
    {
      type: Schema.Types.Decimal128,
      required: true,
    },
  ],
  users: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
  answerType: {
    type: String,
    required: true,
    enum: ["MATH_INPUT","SELECT_ONE","RADIO_CHOICE"],
  },
  choices: [{
    type: String
  }],
  title: {
    type:String,
    required: true
  },
  usedItems: [{
    _id: false,
    itemName: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
  }],
  answerBody: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
  },
  checkAnswerType: {
    type: String,
    enum: ["MATH_EVALUATE","EQUAL_STRING","RULE_BASE","POWER_OVER_ONE"],
    default: "EQUAL_STRING",
  },
  answerForDisplay: {
    type: String,
  },
  hintBody: {
    type: String,
  }
});

module.exports = mongoose.model("Problem", ProblemSchema);
