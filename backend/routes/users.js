import express from "express";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

// Toggle follow/unfollow on another user
router.post("/:id/follow", requireAuth, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.userId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const me = await User.findById(req.userId);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const isFollowing = me.following.some((id) => id.toString() === targetId);

    if (isFollowing) {
      me.following = me.following.filter((id) => id.toString() !== targetId);
      target.followers = target.followers.filter((id) => id.toString() !== req.userId);
    } else {
      me.following.push(targetId);
      target.followers.push(req.userId);
    }

    await me.save();
    await target.save();

    res.json({ following: !isFollowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
