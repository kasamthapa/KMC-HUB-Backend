import { z } from "zod";
// Post Schema
export const postSchema = z.object({
  content: z
    .string()
    .max(300, { message: "Content must be 300 characters or less" })
    .optional(),
  mediaType: z.enum(["image", "video"]).optional(), // File uploads handled separately in controller
});
// Zod schema for updating only content
export const updatePostSchema = z.object({
  content: z.string().max(300),
});
export const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty").max(300, "Max 300 chars"),
});

// Inferred Types
export type Post = z.infer<typeof postSchema>;
