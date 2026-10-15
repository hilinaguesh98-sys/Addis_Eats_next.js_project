import { z } from 'zod'

export const orderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  address: z.string().trim().optional().default(''),
  neighborhood: z.string().trim().min(1, 'Neighbourhood is required').default('Not provided'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      qty: z.number().int().min(1).max(20),
    })
  ).min(1, 'At least one item is required'),
})