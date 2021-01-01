const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReportSchema = new Schema({
  problemId: {
    type: ObjectID,
    ref: "Problem",
    required: true,
  },
  userId: {
    type: ObjectID,
    ref: "Problem",
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Report", ReportSchema);
