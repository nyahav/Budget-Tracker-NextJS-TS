import { z } from "zod";

export const CreateLocationSchema = z.object({
    // Core location details
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    
    // Physical characteristics
    squareFeet: z.coerce.number().positive(),
    bedrooms: z.coerce.number().int().min(0),
    yearBuilt: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
    
    // Financial details
    purchasePrice: z.coerce.number().positive().multipleOf(0.01),
    currentValue: z.coerce.number().positive().multipleOf(0.01),
    monthlyRent: z.coerce.number().positive().multipleOf(0.01).optional(),
    
    // Additional details
    propertyType: z.enum(["house", "apartment", "condo", "land", "commercial"]),
    status: z.enum(["active", "pending", "sold", "rented"]),
});

export type CreateLocationSchemaType = z.infer<typeof CreateLocationSchema>;