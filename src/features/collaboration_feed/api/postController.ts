/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import mongoose from "mongoose";

import { postSchema, Post, updatePostSchema } from "../schemas/posts.schema";
import postModel from "../models/posts";
import { JwtPayload } from "../../../middlewares/AuthMiddleware";
import path from "node:path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (
    req: unknown,
    file: { originalname: string },
    cb: (arg0: null, arg1: string) => void
  ) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

interface CustomRequest extends Request<{ postId: string }, unknown, Post> {
  file: any;
  user?: JwtPayload;
}
export const createPostController = [
  upload.single("media"),
  async (req: CustomRequest, res: Response) => {
    try {
      const { content, mediaType } = postSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const media = req.file
        ? [{ url: `/uploads/${req.file.filename}`, type: mediaType }]
        : [];
      const post = new postModel({ userId, content, media });
      await post.save();
      const populatedPost = await postModel
        .findById(post._id)
        .populate("userId", "name email avatar role");
      console.log("Created post:", populatedPost); // Debug
      res.status(201).json({ post: populatedPost });
    } catch (e) {
      console.error("Error creating post:", e);
      res.status(500).json({ message: "Error creating post" });
    }
  },
];

export const getAllPostController = async (req: Request, res: Response) => {
  try {
    const posts = await postModel
      .find()
      .populate("userId", "name email avatar role");
    console.log(
      "Fetched posts:",
      posts.map((p) => ({
        _id: p._id,
        userId: p.userId,
        content: p.content,
      }))
    ); // Debug
    res.status(200).json({ posts });
  } catch (e) {
    console.error("Error fetching posts:", e);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const editPostController = async (req: CustomRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = updatePostSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    if (post.userId.toString() !== userId) {
      res.status(403).json({ message: "Not authorized to edit this post" });
      return;
    }
    const updatedPost = await postModel
      .findByIdAndUpdate(
        postId,
        { content, updatedAt: new Date() },
        { new: true }
      )
      .populate("userId", "name email avatar role");
    if (!updatedPost) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    console.log("Edited post:", updatedPost); // Debug
    res.status(200).json(updatedPost);
  } catch (e: any) {
    console.error("Error editing post:", e);
    res.status(500).json({ message: "Error editing post" });
  }
};

export const deletePostController = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    const post = await postModel.findOneAndDelete({
      _id: postId,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!post) {
      res.status(404).json({
        message: "Post not found or you are not authorized to delete it",
      });
      return;
    }
    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log("Internal Server Error", error);
    res.status(500).json({
      message: "Error deleting post !",
    });
    return;
  }
};

export const likePostController = async (req: CustomRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    console.log("Like Post - UserID:", userId, "PostID:", postId); // Debug
    if (!userId) {
      console.log("Unauthorized: No user ID");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log("Invalid post ID:", postId);
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    const post = await postModel.findById(postId);
    if (!post) {
      console.log("Post not found:", postId);
      res.status(404).json({ message: "Post not found" });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (post.likes.some((id) => id.equals(userObjectId))) {
      console.log("Already liked:", postId, userId);
      res.status(400).json({ message: "You already liked this post" });
      return;
    }
    post.likes.push(userObjectId);
    await post.save();
    const populatedPost = await postModel.findById(post._id).populate("userId");
    res.status(200).json({
      message: "Post liked successfully",
      post: populatedPost,
    });
  } catch (e) {
    console.error("Error liking post:", e);
    res.status(500).json({ message: "Error liking post" });
  }
};
export const unlikePostController = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!post.likes.includes(userObjectId)) {
      res.status(400).json({ message: "You have not liked this post yet!" });
      return;
    }
    //filter userId inside likes that are not equal to current Userid
    post.likes = post.likes.filter((id) => !id.equals(userObjectId));
    await post.save();
    res.status(200).json({
      message: "Unliked successfully",
      post,
    });
  } catch (e) {
    console.log("Internal Server Error", e);
    res.status(500).json({
      message: "Error unliking post!",
    });
  }
};

export const getLikeCountController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    const likesCount = post.likes.length;
    res.status(200).json({
      TotalLikes: likesCount,
    });
  } catch (e) {
    console.log("Internal Server Error", e);
    res.status(500).json({
      message: "Error gettng  post likeCount!",
    });
  }
};
