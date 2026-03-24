const mongoose = require("mongoose");

const RevisionSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  lastRevisedAt: { type: Date, default: Date.now },
  nextRevisionAt: Date,
  strength: { type: Number, default: 1 }
}, {
  timestamps: true
});

module.exports = mongoose.model("Revision", RevisionSchema);

