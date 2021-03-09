const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  problems: [
    {
      _id: false,
      subject: {
        type: String,
        required: true,
      },
      topic: {
        type: String,
        required: true,
      },
      subtopic: {
        type: String,
        required: true,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      difficulty: [
        {
          _id: false,
          difficultyName: {
            type: String,
          },
          amount: {
            type: Number,
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("UserProgress", UserProgressSchema);
