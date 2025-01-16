import { prisma } from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

//swager
/**
 * @swagger
 * /api/history-data:
 *   get:
 *     summary: Retrieve historical transaction data
 *     description: Get aggregated transaction data based on timeframe (month/year)
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *           enum: [month, year]
 *         description: Time period for data aggregation
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 11
 *         description: Month (0-11) for data filtering
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2500
 *         description: Year for data filtering
 *     responses:
 *       200:
 *         description: Historical data aggregation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 income:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: 
 *                         type: string
 *                         format: date
 *                       amount:
 *                         type: number
 *                 expenses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       amount:
 *                         type: number
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */



const getHistoryDataSchema = z.object({
    timeframe: z.enum(["month","year"]),
    month: z.coerce.number().min(0).max(11),
    year: z.coerce.number().min(2000).max(2500),
})

export async function GET(request : Request){
    const user = await currentUser();
    if(!user){
        redirect("/sign-in")
    }

    const {searchParams} = new URL(request.url);
    const timeframe = searchParams.get("timeframe");
    const year=searchParams.get("year")
    const month=searchParams.get("month")

    const queryParams = getHistoryDataSchema.safeParse({
        timeframe,
        month,
        year
    })

    if(!queryParams.success){
        return Response.json(queryParams.success,{
            status:400,
        })
    }

    const data = await getHistoryData(user.id,queryParams.data.timeframe,{
        month:queryParams.data.month,
        year:queryParams.data.year
    })
    return Response.json(data);
}

export type getHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>
async function getHistoryData(userId:string,timeframe:Timeframe, period:Period) {
    switch(timeframe){
        case "year":
            return await getYearHistoryData(userId,period.year)
        case "month":
            return await getMonthHistoryData(userId,period.year,period.month)

    }
}
type HistoryData ={
    expense: number,
    income:number,
    year:number,
    month:number,
    day?: number,
}
async function getYearHistoryData(userId:string,year:number){
    const result = await prisma.yearHistory.groupBy({
        by:["month"],
        where :{
            userId,
            year
        },
        _sum:{
            expense:true,
            income:true,
        },
        orderBy :[{
            month:"asc"
        }],
    });
    if(!result ||result.length === 0)
        return []
    const history:HistoryData[]= [];
    for (let i = 0; i < 12; i++) {
        let expense = 0;
        let income = 0;
        const month = result.find((row) => row.month === i);
        
        if (month) {
            expense = month._sum.expense || 0;
            income = month._sum.income || 0;
        }
    history.push({
        year,
        month:i,
        expense,
        income,
        })
    }
    return history;
}
async function getMonthHistoryData(userId:string,year:number,month:number){
    const result = await prisma.monthHistory.groupBy({
        by:["day"],
        where :{
            userId,
            year,
            month,
        },
        _sum:{
            expense:true,
            income:true,
        },
        orderBy :[{
            day:"asc"
        }],
    });   
    if(!result ||result.length === 0)
        return []
    const history:HistoryData[]= [];
    const daysInMonth = getDaysInMonth(new Date(year,month))
    for (let i = 1; i <= daysInMonth; i++) {
        let expense = 0;
        let income = 0;
        const day = result.find((row) => row.day === i);
        if (day) {
            expense = day._sum.expense || 0;
            income = day._sum.income || 0;
        }
        history.push({
            expense,
            income,
            year,
            month,
            day:i,
            })
    }
    return history;    
}