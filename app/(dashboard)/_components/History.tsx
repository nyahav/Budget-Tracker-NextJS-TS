"use client"

import React, { useMemo, useState } from 'react'
import { UserSetting } from '@prisma/client'
import { Period, Timeframe } from '@/lib/types';
import { GetFormatterForCurrency } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HistoryPeriodSelector from './HistoryPeriodSelector';
import { useQuery } from '@tanstack/react-query';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts"

interface Props {
  userSettings: UserSetting;
}

function History({ userSettings }: Props) {
    const [timeframe,settimeframe]=useState<Timeframe>("month")
    const [period,setPeriod]=useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    })
    const formatter = useMemo(()=>{
        return GetFormatterForCurrency(userSettings.currency)
    },[userSettings.currency])

    const historyDataQuery = useQuery({
        queryKey:["overview","history",timeframe,period],
        queryFn:()=> fetch(`api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`)
        .then((res) =>res.json())
    })

    const dataAvailable = historyDataQuery.data && historyDataQuery.data.length > 0;
  return (
    <div className='container'>
        <h2 className="mt-12 text-3xl font-bold">
            History
        </h2>
        <Card className='col-span-12 mt-2 w-full'>
            <CardHeader className='gap-2'>
                <CardTitle className='grid grid-flow-row justify-between gap-2 md:grid-flow-row'>
                <HistoryPeriodSelector
                 period={period} 
                 setPeriod={setPeriod} 
                 timeframe={timeframe} 
                 setTimeFrame={settimeframe}
                 />
                    <div className="flex  h-10 gap-2">
                        <Badge 
                        variant={"outline"} 
                        className='flex items-center gap-2 text-sm'>
                            <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                            Income
                        </Badge>
                        <Badge 
                        variant={"outline"} 
                        className='flex items-center gap-2 text-sm'>
                            <div className="h-4 w-4 rounded-full bg-red-500"></div>
                            Expence
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
                    {
                        dataAvailable ? (
                            <ResponsiveContainer width={'100%'} height={300}>
                                <BarChart height={300} data={historyDataQuery.data} barCategoryGap={5}>
                                    <defs>
                                        <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset={"0"} stopColor='#10b981' stopOpacity={"1"}/>
                                            <stop offset={"1"} stopColor='#10b981' stopOpacity={"0"}/>
                                           
                                        </linearGradient>
                                        <linearGradient id="expenceBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset={"0"} stopColor='#ef4444' stopOpacity={"1"}/>
                                            <stop offset={"1"} stopColor='#ef4444' stopOpacity={"0"}/>
                                           
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                    strokeDasharray="5 5" 
                                    strokeOpacity={"0.2"} 
                                    vertical={false}/>
                                    <XAxis 
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    padding={{left:5,right:5}}
                                    dataKey={(data)=>{
                                        const{year,month,day} = data;
                                        const date = new Date(year,month,day || 1);
                                        if(timeframe === 'year'){
                                            return date.toLocaleDateString("default",{
                                                month:"long"
                                            })
                                        }
                                        return date.toLocaleDateString("default",{
                                           day: "2-digit"
                                        })
                                    }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Card className='flex h-[300px] flex-col items-center justify-center bg-background'>
                                No data for the selected period
                                <p className="text-sm text-muted-foreground">
                                    Try selecting a different period or adding new transactions
                                </p>
                            </Card>
                        )
                    }
                </SkeletonWrapper>
            </CardContent>
        </Card>
    </div>
  )
}

export default History
