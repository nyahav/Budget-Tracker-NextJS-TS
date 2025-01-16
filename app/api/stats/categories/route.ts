import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { get } from "http";
import { redirect } from "next/navigation";

//swagger
/**
 * @swagger
 * /api/stats/categories:
 *   get:
 *     summary: Get category statistics
 *     description: Retrieve transaction statistics grouped by categories for a specified time period
 *     tags:
 *       - Statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Category statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     description: Category name
 *                   amount:
 *                     type: number
 *                     description: Total amount for category
 *                   percentage:
 *                     type: number
 *                     description: Category percentage of total
 *               example:
 *                 - category: "Housing"
 *                   amount: 1200.00
 *                   percentage: 35.5
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


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