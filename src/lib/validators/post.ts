import { z } from 'zod'

export const postValidator = z.object({
  title: z
    .string()
    .min(3, 'Título deve possuir ao menos 3 caracteres.')
    .max(128, 'Título não deve possuir mais do que 128 caracteres.'),
  subredditId: z.string(),
  content: z.any(),
})

export type PostCreationRequest = z.infer<typeof postValidator>
