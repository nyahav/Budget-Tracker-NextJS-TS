import { z } from "zod";

// Define enums to match the Prisma schema
const PurposeEnum = z.enum(["FOR_SALE", "FOR_RENT"]);
const RentFrequencyEnum = z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]);

// Create schema for creating a new property listing
export const CreatePropertySchema = z.object({
  title: z.string().min(1).max(255), // Title of the property
  purpose: PurposeEnum, // Matches the Purpose enum
  price: z.number().min(0), // Positive number for price
  rooms: z.number().int().min(1), // At least one room
  baths: z.number().int().min(0), // Bathrooms, allow zero
  area: z.number().min(1), // Positive number for area (square meters or sqft)
  rentFrequency: RentFrequencyEnum.optional(), // Optional field matching RentFrequency enum
  location: z.string().min(1).max(255), // Location string
  description: z.string().min(1), // Description must be non-empty
  furnishingStatus: z.string().optional(), // Optional furnishing status
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }), // Validate date format
  updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }), // Validate date format
});

export type CreatePropertySchemaType = z.infer<typeof CreatePropertySchema>;

// Create schema for deleting a property listing by its ID
export const DeletePropertySchema = z.object({
  id: z.string().uuid(), // ID must be a valid UUID
});

export type DeletePropertySchemaType = z.infer<typeof DeletePropertySchema>;
