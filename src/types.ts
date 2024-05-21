import * as z from 'zod';

export const GetBody = z.object({
  id: z.number().int().optional(),
});

export const PostBody = z.object({
  name: z.string().min(1).default('default name'),
});;

export const PutBody = z.object({
  id: z.number().int(),
  new_name: z.string().min(1),
});

export const DeleteBody = z.object({
  id: z.number().int(),
});;

export type GetBody = z.infer<typeof GetBody>
export type PostBody = z.infer<typeof PostBody>
export type PutBody = z.infer<typeof PutBody>
export type DeleteBody = z.infer<typeof DeleteBody>