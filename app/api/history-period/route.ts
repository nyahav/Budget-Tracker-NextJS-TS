import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


//swagger
/**
 * @swagger
 * /api/history-period:
 *   get:
 *     summary: Retrieve available history periods
 *     description: Get list of years for which transaction history exists
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *                 description: Year
 *               example: [2022, 2023, 2024]
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */

export async function GET(request : Request){
    const user = await currentUser();
    if(!user){
        redirect("/sign-in")
    }

    const periods = await getHistoryPeriods(user.id);
    return Response.json(periods)
}
export type getHistoryPeriodsResponseType= Awaited<ReturnType<typeof getHistoryPeriods>>;
async function getHistoryPeriods(userId:string){
    const result=await prisma.monthHistory.findMany({
        where: {
            userId,
        },
        select:{
            year:true,
        },
        distinct:["year"],
        orderBy:[
            {
                year:"asc"
            }
        ]
    })

    const years = result.map(el => el.year)
    console.log(years)
    if(years.length === 0){
        return [new Date().getFullYear()]
    }
    return years;
}