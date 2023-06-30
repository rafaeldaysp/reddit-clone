import { z } from 'zod'

export const commentValidator = z.object({
  postId: z.string(),
  text: z.string().min(1).max(300),
  replyToId: z.string().optional(),
})

export type CommentRequest = z.infer<typeof commentValidator>
