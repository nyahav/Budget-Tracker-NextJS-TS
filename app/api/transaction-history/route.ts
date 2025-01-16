import { GetFormatterForCurrency } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


//swagger
/**
 * @swagger
 * /api/transaction-history:
 *   get:
 *     summary: Retrieve transaction history
 *     description: Get all transactions for a specified date range
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for transactions
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for transactions
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   formattedAmount:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   category:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [income, expense]
 *                   userId:
 *                     type: string
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */



export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        return redirect("/sign-in");
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

  const queryParams = overviewQuerySchema.safeParse({
    from,
    to
  });
  if(!queryParams.success)
   {
    return Response.json(queryParams.error.message,{
        status:400
    })
   }
   const transactions = await getTransactionHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to,
   )
   return Response.json(transactions);
}

export type getTransactionHistoryResponseType=Awaited<ReturnType<typeof getTransactionHistory>>
async function getTransactionHistory(userId:string, from:Date,to:Date){
    const userSettings=await prisma.userSetting.findUnique({
        where:{
            userId,
        }
       
    })
    if(!userSettings){
        throw new Error("user settings not found")
    }

    const formatter = GetFormatterForCurrency(userSettings.currency);
    const transactions = await prisma.transaction.findMany({
        where:{
            userId,
            date:{
                gte:from,
                lte:to,
            }
        },
        orderBy:{
            date:"desc"
        }
    })

    return transactions.map((transaction) => ({
        ...transaction,
        //format the amount with the user currency
        formatterAmount : formatter.format(transaction.amount)
    }))
}