import {z} from "zod";
// Post Schema
export const postSchema = z.object({
  content: z.string().max(300, { message: 'Content must be 300 characters or less' }).optional(),
  media: z.any().optional(), // File uploads handled separately in controller
});
// Zod schema for updating only content
export const updatePostSchema = z.object({
  content: z.string().max(300),
});



// Inferred Types
export type Post = z.infer<typeof postSchema>;