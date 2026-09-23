import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z
        .string({ required_error: 'Full name is required' })
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(60, 'Full name cannot exceed 60 characters'),
      phone: z
        .string({ required_error: 'Phone number is required' })
        .trim()
        .min(8, 'Phone number must be at least 8 digits')
        .max(15, 'Phone number cannot exceed 15 digits'),
      address: z
        .string({ required_error: 'Street address is required' })
        .trim()
        .min(5, 'Street address must be at least 5 characters')
        .max(200, 'Street address cannot exceed 200 characters'),
      city: z
        .string({ required_error: 'City is required' })
        .trim()
        .min(2, 'City must be at least 2 characters')
        .max(50, 'City cannot exceed 50 characters'),
      state: z
        .string({ required_error: 'State is required' })
        .trim()
        .min(2, 'State must be at least 2 characters')
        .max(50, 'State cannot exceed 50 characters'),
      postalCode: z
        .string({ required_error: 'Postal code is required' })
        .trim()
        .min(4, 'Postal code must be at least 4 characters')
        .max(10, 'Postal code cannot exceed 10 characters'),
    }),
    paymentMethod: z.enum(['COD']).optional().default('COD'),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Order ID is required' }).trim(),
  }),
});
