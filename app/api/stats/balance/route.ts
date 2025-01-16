import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { ToastClose } from "@radix-ui/react-toast";
import { redirect } from "next/navigation";


//swagger
/**
 * @swagger
 * /api/stats/balance:
 *   get:
 *     summary: Get balance statistics
 *     description: Retrieve total income and expenses for a specified time period
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
 *         description: Balance statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expense:
 *                   type: number
 *                   description: Total expenses
 *                 income:
 *                   type: number
 *                   description: Total income
 *               example:
 *                 expense: 1500.00
 *                 income: 3000.00
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export async function GET(request:Request){
    const user = await currentUser();
    if(!user){
        redirect("/sign-in")
    }

    const {searchParams} = new URL(request.url);
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const queryParams = overviewQuerySchema.safeParse({from, to});
    if(!queryParams.success){
        return Response.json(queryParams.error.message,{
            status:400
        })
    }

    const stats = await getBalanceStats(
        user.id,
        queryParams.data.from,
        queryParams.data.to,
    )

    return Response.json(stats)
}
export type getBalanceStatsResponseType = Awaited<ReturnType<typeof getBalanceStats>>;
async function getBalanceStats(userId:string,from:Date,to:Date) {
    const totals =await prisma.transaction.groupBy({
        by: ["type"],
        where:{
            userId,
            date:{
                gte:from,
                lte:to,
            },
        },
        _sum:{
            amount:true,
        }
    })
    return {
        expense: totals.find(t =>t.type ==="expense")?._sum.amount || 0,
        income: totals.find(t =>t.type ==="income")?._sum.amount || 0,
    }
}