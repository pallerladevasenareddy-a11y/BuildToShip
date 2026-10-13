import { z } from 'zod';

export const reviewActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'RESOLVE_FINDING']),
  findingId: z.string().uuid().optional(),
  note: z.string().trim().optional(),
});
