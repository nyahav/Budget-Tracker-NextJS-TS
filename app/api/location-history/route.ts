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
            createdAt: "desc"  // Show newest properties first
        }
    })

    return locations.map((location) => ({
        ...location,
        formattedPurchasePrice: formatter.format(location.purchasePrice),
        formattedCurrentValue: formatter.format(location.currentValue),
        formattedMonthlyRent: location.monthlyRent ? formatter.format(location.monthlyRent) : 'N/A'
    }))
}