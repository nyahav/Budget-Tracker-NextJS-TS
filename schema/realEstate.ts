import { z } from "zod";

// Create schema for creating a new real estate listing
export const CreateRealEstateSchema = z.object({
  status: z.enum(["new", "updated", "default", "removed"]),
  linkToken: z.string().min(1).max(255),
  estateType: z.string().min(1).max(100),
  street: z.string().min(1).max(255),
  neighborhood: z.string().min(1).max(255),
  settlement: z.string().min(1).max(255),
  rooms: z.number().int().min(1),
  floor: z.string().min(1).max(50), // Handle both numeric floor and 'קרקע' string
  squareMeters: z.number().int().min(1),
  updatedAt: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }), // Ensure it's a valid date string
  price: z.string().min(1).max(50),
});

export type CreateRealEstateSchemaType = z.infer<typeof CreateRealEstateSchema>;

// Create schema for deleting a real estate listing by its linkToken (unique identifier)
export const DeleteRealEstateSchema = z.object({
  linkToken: z.string().min(1).max(255), // This is the unique token to identify the listing
});

export type DeleteRealEstateSchemaType = z.infer<typeof DeleteRealEstateSchema>;
