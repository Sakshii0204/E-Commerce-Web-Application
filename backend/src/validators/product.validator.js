import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid product ID format'),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(120, 'Name cannot exceed 120 characters'),
    description: z
      .string({ required_error: 'Product description is required' })
      .trim()
      .min(5, 'Description must be at least 5 characters')
      .max(2000, 'Description cannot exceed 2000 characters'),
    price: z
      .number({ required_error: 'Product price is required', invalid_type_error: 'Price must be a number' })
      .min(0, 'Price must be greater than or equal to 0'),
    category: z
      .string({ required_error: 'Product category is required' })
      .trim()
      .min(1, 'Category cannot be empty'),
    brand: z
      .string({ required_error: 'Product brand is required' })
      .trim()
      .min(1, 'Brand cannot be empty'),
    image: z
      .string({ required_error: 'Product image URL is required' })
      .trim()
      .url('Product image must be a valid URL'),
    stock: z
      .number({ required_error: 'Product stock is required', invalid_type_error: 'Stock must be a number' })
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative'),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid product ID format'),
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().min(5).max(2000).optional(),
      price: z.number().min(0).optional(),
      category: z.string().trim().min(1).optional(),
      brand: z.string().trim().min(1).optional(),
      image: z.string().trim().url('Product image must be a valid URL').optional(),
      stock: z.number().int('Stock must be an integer').min(0).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});
