import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z
      .string({ required_error: 'Product ID is required' })
      .regex(objectIdRegex, 'Invalid product ID format'),
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z
      .string({ required_error: 'Product ID is required' })
      .regex(objectIdRegex, 'Invalid product ID format'),
  }),
  body: z.object({
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    productId: z
      .string({ required_error: 'Product ID is required' })
      .regex(objectIdRegex, 'Invalid product ID format'),
  }),
});
