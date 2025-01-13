"use server"

import { prisma } from "@/lib/prisma";
import { CreateLocationSchema,CreateLocationSchemaType } from "@/schema/locations";
import { currentUser } from "@clerk/nextjs/server";
import { Locations } from "@prisma/client";
import { redirect } from "next/navigation";

export async function CreateLocation(form:CreateLocationSchemaType){
    // Validate the form data
    const parseBody = CreateLocationSchema.safeParse(form)
    if(!parseBody.success){
        throw new Error(parseBody.error.message)
    }
    // Ensure the user is logged in
    const user = await currentUser();
    if(!user){
        redirect("/sign-in")
    }
    const { 
        // Core location details
        address, 
        city, 
        state, 
        zipCode,
    
        // Physical characteristics
        squareFeet,
        bedrooms,
        yearBuilt,
    
        // Financial details
        purchasePrice,
        currentValue,
        monthlyRent,
    
        // Additional details
        propertyType,
        status
    } = parseBody.data;

    // Check if a property with the same address exists for the user
    const existingProperty = await prisma.locations.findFirst({
        where: {
            userId: user.id,
            address: address,
        },
    });

    if (existingProperty) {
        throw new Error("A property with this address already exists");
    }

    const newLocation = await prisma.locations.create({
        data: {
            userId: user.id,
            address,
            city,
            state,
            zipCode,
            squareFeet,
            bedrooms,
            yearBuilt,
            purchasePrice,
            currentValue,
            monthlyRent,
            propertyType,
            status,
        },
    });

    return newLocation;
}