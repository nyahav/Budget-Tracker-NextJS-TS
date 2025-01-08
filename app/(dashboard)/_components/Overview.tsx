"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { UserSetting } from '@prisma/client'
import { startOfMonth } from 'date-fns'
import React, { useState } from 'react'
import { differenceInDays } from 'date-fns';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constans';
import { toast, Toaster } from 'sonner'
import StatsCards from './StatsCards';
import CategoriesStats from './CategoriesStats';

function Overview({userSettings}:{userSettings:UserSetting}) {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()), 
        to: new Date(),
    });
  return (
    <>
    <div className='container flex flex-wrap items-end justify-between gap-2 py-6'>
        <h2 className='text-3xl font-bold'>Overview</h2>
            <div className="flex items-center gap-3">
                <DateRangePicker 
                initialDateFrom={dateRange.from}
                initialDateTo={dateRange.to}
                showCompare={false}
                onUpdate={(values) =>{
                    const { from, to } = values.range;
                    if(!from || !to) return;
                    if(differenceInDays(to, from) > MAX_DATE_RANGE_DAYS){
                        console.log('Showing toast error');
                        toast.error(`The Max date range is ${MAX_DATE_RANGE_DAYS} days!`);
                        return;
                    }
                    setDateRange({from , to});
                }}
                />
            </div>
    </div>
    <div className='container flex w-full flex-col gap-2'>
    <StatsCards
        userSetting={userSettings}
        from={dateRange.from}
        to={dateRange.to}
        />
        <CategoriesStats 
        
           userSetting={userSettings}
           from={dateRange.from}
           to={dateRange.to}
        />
    </div>
    </>
  )
}

export default Overview