"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constans';
import { differenceInDays, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import TransactionTable from './_components/TransactionTable';
import CreateTransactionDialog from '../_components/CreateTransactionDialog';
import { Button } from '@/components/ui/button';

function TranasctionPage() {
    const [dateRange,setDateRange]=useState<{from:Date,to:Date}>({
        from:startOfMonth(new Date()),
        to: new Date()
    })
  return (
    <>
    <div className='border-b bg-card'>
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
        <div>
            <p className='text-3xl font-bold'>Transactions history</p>
            <div className="flex items-center gap-3 pt-10">
            <CreateTransactionDialog trigger={
            <Button variant={"outline"} className='w-[200px] border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white'>
              New income🤑
            </Button> }
            type="income"
            />
            <CreateTransactionDialog trigger={
            <Button variant={"outline"} className=' w-[200px] border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white'>
              New expense😡
            </Button>}
            type='expense'
            />
          </div>
        </div>
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
    <div className="container">
        <TransactionTable from={dateRange.from} to={dateRange.to}/>
    </div>
    </>
  )
}

export default TranasctionPage