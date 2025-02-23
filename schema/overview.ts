import { MAX_DATE_RANGE_DAYS } from "@/lib/constans";
import { differenceInDays } from "date-fns";
import { z } from "zod";

export const overviewQuerySchema = z.object({
    from: z.coerce.date(),
    to: z.coerce.date()
}).refine((args)=>{
    const {from,to} =args;
    const days = differenceInDays(to,from);

    const isValidRange = (days: number) => 0 && days <=MAX_DATE_RANGE_DAYS;
    return isValidRange
})