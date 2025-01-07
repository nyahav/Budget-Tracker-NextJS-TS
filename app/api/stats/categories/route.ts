import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { get } from "http";
import { redirect } from "next/navigation";


export async function GET(request:Request){
    console.log("GET function called");
    const user = await currentUser();
    if(!user){
        redirect("/sign-in")
    }
    const {searchParams} = new URL(request.url);
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    
    const queryParams = overviewQuerySchema.safeParse({from, to});
    if(!queryParams.success){
       throw new Error(queryParams.error.message)
    }

    const stats = await getCategoriesStats(
        user.id,
        queryParams.data.from,
        queryParams.data.to,
        
    )
    console.log("stats" ,stats);
    return Response.json(stats)

}
export type getCategoriesStatsResponseType = Awaited<ReturnType<typeof getCategoriesStats>>
async function getCategoriesStats(userId: string, from: Date, to: Date) {
    const stats = await prisma.transaction.groupBy({
        by: ["type", "category", "categoryIcon"],
        where: {
            userId,
            date: {
                gte: from,
                lte: to,
            },
        },
        _sum: {
            amount: true,
        },
        orderBy: {
            _sum: {
                amount: "desc",
            },
        },
    });
    console.log("Inside getCategoriesStats:", stats); 
    return stats;
}