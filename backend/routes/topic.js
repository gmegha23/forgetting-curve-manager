const express = require("express");
const router = express.Router();

const Topic = require("../models/Topic");
const Revision = require("../models/Revision");
const auth = require("../middleware/authMiddleware");
const { memoryPercent, nextRevision } = require("../utils/forgettingCurve");

// ➕ Add Topic
router.post("/", auth, async (req, res) => {
  try {
    const topic = await Topic.create({
      ...req.body,
      userId: req.userId,
    });

    await Revision.create({
      topicId: topic._id,
      lastRevisedAt: new Date(),
      nextRevisionAt: nextRevision(topic.strength),
    });

    res.json(topic);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 📄 Get Topics + Memory %
router.get("/", auth, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.userId });
    const revisions = await Revision.find();

    const data = topics.map((t) => {
      const r = revisions.find((rv) => rv.topicId.equals(t._id));

      const days =
        (Date.now() - r.lastRevisedAt) / (1000 * 60 * 60 * 24);

      return {
        ...t._doc,
        memory: Math.round(memoryPercent(days, t.strength)),
        nextRevisionAt: r.nextRevisionAt,
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 🔁 Mark Revised
router.post("/revise/:id", auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ msg: "Topic not found" });

    topic.strength += 1;
    await topic.save();

    await Revision.findOneAndUpdate(
      { topicId: topic._id },
      {
        lastRevisedAt: new Date(),
        nextRevisionAt: nextRevision(topic.strength),
      }
    );

    res.json({ msg: "Revised successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
