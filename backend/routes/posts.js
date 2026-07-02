import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

// Get all posts, newest first, with per-user like/follow state included
router.get("/", requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).select("following");
    const followingSet = new Set((me?.following || []).map((id) => id.toString()));

    const posts = await Post.find()
      .populate("author", "name email")
      .populate("comments.author", "name")
      .sort({ createdAt: -1 });

    const formatted = posts.map((p) => ({
      id: p._id,
      authorId: p.author._id,
      author: p.author.name,
      handle: "@" + p.author.email.split("@")[0],
      text: p.text,
      likes: p.likes.length,
      liked: p.likes.some((id) => id.toString() === req.userId),
      following: followingSet.has(p.author._id.toString()),
      comments: p.comments.map((c) => ({
        id: c._id,
        author: c.author?.name || "Unknown",
        text: c.text,
      })),
      createdAt: p.createdAt,
    }));

    res.json({ posts: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a post
router.post("/", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Post text is required" });
    }

    const post = await Post.create({ author: req.userId, text: text.trim() });
    const populated = await post.populate("author", "name email");

    res.status(201).json({
      post: {
        id: populated._id,
        authorId: populated.author._id,
        author: populated.author.name,
        handle: "@" + populated.author.email.split("@")[0],
        text: populated.text,
        likes: 0,
        liked: false,
        following: false,
        comments: [],
        createdAt: populated.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle like on a post
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a comment to a post
router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ author: req.userId, text: text.trim() });
    await post.save();

    const populated = await post.populate("comments.author", "name");
    const newComment = populated.comments[populated.comments.length - 1];

    res.status(201).json({
      comment: { id: newComment._id, author: newComment.author.name, text: newComment.text },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete your own post
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
