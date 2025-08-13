// models/posts.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  media: { url: string; type: "image" | "video" }[];
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 300 },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      text: { type: String, required: true, maxlength: 300 },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPost>("Post", postSchema);
