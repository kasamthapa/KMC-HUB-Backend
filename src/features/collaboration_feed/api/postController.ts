/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
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
      const user = req.user;
      const { content, mediaType } = postSchema.parse(req.body);
      const postData: any = {
        userId: user.id,
        content,
        media: [],
      };
      if (req.file && mediaType) {
        postData.media = [
          { url: `/uploads/${req.file.filename}`, type: mediaType },
        ];
      }
      const post = await postModel.create(postData);
      res.status(201).json({
        message: "created post successfully",
        post,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Validation failed", errors: error.errors });
        return;
      }
      console.error("Error creating post:", error);
      res
        .status(500)
        .json({ message: "Server error", error: (error as Error).message });
      return;
    }
  },
];

export const getAllPostController = async (req: Request, res: Response) => {
  try {
    const posts = await postModel.find();
    res.status(200).json({
      posts,
    });
    return;
  } catch (e) {
    console.log("Internal Server Error", e);
    res.status(500).json({
      message: "Error getting all Posts",
    });

    return;
  }
};

export const editPostController = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;
    const { content } = updatePostSchema.parse(req.body);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    const post = await postModel.findOne({
      _id: postId,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!post) {
      res.status(404).json({
        message: "Post not found or you are not authorized to edit it",
      });
      return;
    }
    post.content = content;
    await post.save();
    res.status(200).json({
      message: "Post updated successfully",
      post: {
        _id: post._id,
        content: post.content,
        media: post.media,
        likes: post.likes.length,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
      return;
    }
    console.log("Internal Server Error", error);
    res.status(500).json({
      message: "Error editing post !",
    });
    return;
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

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
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
    if (post.likes.some((id) => id.equals(userObjectId))) {
      res.status(400).json({ message: "You already liked this post" });
      return;
    }
    post.likes.push(userObjectId);
    await post.save();
    res.status(200).json({
      message: "Post liked successfully",
      post,
    });
  } catch (e) {
    console.log("Internal Server Error", e);
    res.status(500).json({
      message: "Error liking post !",
    });
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
