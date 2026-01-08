import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string().min(6, 'Password confirmation must be at least 6 characters'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  meta: z.any().optional(),
});

export const listSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  from_name: z.string().min(1, 'From Name is required'),
  from_email: z.string().email('Invalid From Email'),
  html_body: z.string().optional(),
  template_id: z.number().optional(),
});

export const templateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  html_body: z.string().min(1, 'HTML body is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ListInput = z.infer<typeof listSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
