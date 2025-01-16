import { GetFormatterForCurrency } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


//swagger
/**
 * @swagger
 * /api/location-history:
 *   get:
 *     summary: Retrieve location history
 *     description: Get all real estate locations for the authenticated user
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   squareFeet:
 *                     type: number
 *                   bedrooms:
 *                     type: integer
 *                   yearBuilt:
 *                     type: integer
 *                   purchasePrice:
 *                     type: number
 *                   currentValue:
 *                     type: number
 *                   monthlyRent:
 *                     type: number
 *                   propertyType:
 *                     type: string
 *                     enum: [house, apartment, condo, land, commercial]
 *                   status:
 *                     type: string
 *                     enum: [active, pending, sold, rented]
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create new location
 *     description: Add a new real estate location
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLocationRequest'
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        return redirect("/sign-in");
    }

    try {
        const locations = await getLocationsHistory(user.id);
        return Response.json(locations);
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const user = await currentUser();
    if (!user) {
        return redirect("/sign-in");
    }

    try {
        const data = await request.json();
        console.log("Incoming data:", data);
        if (!data.purchasePrice || !data.currentValue) {
            throw new Error("Missing required fields");
        }
        const newLocation = await prisma.locations.create({
            data: {
                ...data,
                userId: user.id,
            }
        });

        const userSettings = await prisma.userSetting.findUnique({
            where: { userId: user.id }
        });

        if (!userSettings) {
            throw new Error("User settings not found");
        }

        const formatter = GetFormatterForCurrency(userSettings.currency);

        // Return formatted location data
        return Response.json({
            ...newLocation,
            formattedPurchasePrice: formatter.format(newLocation.purchasePrice),
            formattedCurrentValue: formatter.format(newLocation.currentValue),
            formattedMonthlyRent: newLocation.monthlyRent ? 
                formatter.format(newLocation.monthlyRent) : 'N/A'
        });
    } 
    catch (error) {
        console.error("Failed to create location. Error details:", {
            error,
            userId: user.id
        });
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to create location" },
            { status: 500 }
        );
    }
}

export type getLocationsHistoryResponseType = Awaited<ReturnType<typeof getLocationsHistory>>

async function getLocationsHistory(userId: string) {
    const userSettings = await prisma.userSetting.findUnique({
        where: {
            userId,
        }
    })
    
    if (!userSettings) {
        throw new Error("user settings not found")
    }

    const formatter = GetFormatterForCurrency(userSettings.currency);
    const locations = await prisma.locations.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return locations.map((location) => ({
        ...location,
        formattedPurchasePrice: formatter.format(location.purchasePrice),
        formattedCurrentValue: formatter.format(location.currentValue),
        formattedMonthlyRent: location.monthlyRent ? formatter.format(location.monthlyRent) : 'N/A'
    }))
}