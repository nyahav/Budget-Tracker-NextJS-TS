import { GetFormatterForCurrency } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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