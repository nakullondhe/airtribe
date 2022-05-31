const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  title: String,
  link: { type: String, required: true, unique: true },
  answers: Number,
  votes: Number,
  views: Number,
  questionId: { type: String, required: true, unique: true },
  referenceCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Question", QuestionSchema);
