import { getCategoriesStatsResponseType } from '@/app/api/stats/categories/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { TransactionType } from '@/lib/types';
import { UserSetting } from '@prisma/client';
import { useQueries, useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

interface Props {
  from: Date;
  to: Date;
  userSetting: UserSetting;
}

function CategoriesStats({ from, to, userSetting }: Props) {
  const statsQuery = useQuery<getCategoriesStatsResponseType>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
        .then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSetting.currency);
  }, [userSetting.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type={"income"}
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
}

export default CategoriesStats;

function CategoriesCard({
  data,
  type,
  formatter,
}: {
  type: TransactionType;
  formatter: Intl.NumberFormat;
  data: getCategoriesStatsResponseType;
}) {
  let filteredData = [];
  let total = 0;

  // Handle the case when data is an array
  if (Array.isArray(data)) {
    filteredData = data.filter((el) => el.type === type);
    total = filteredData.reduce((acc, el) => acc + (el._sum?.amount || 0), 0);
    console.log("Array data:", data);
    console.log("Filtered data:", filteredData);
    console.log("Total:", total);
  }

  // Handle the case when data is an object
  else if (typeof data === "object" && data !== null) {
    const dataArray = Object.entries(data).map(([key, value]) => ({
      type: key,
      amount: value,
    }));
    filteredData = dataArray.filter((el) => el.type === type);
    total = filteredData.reduce((acc, el) => acc + (el.amount as number || 0), 0);
    console.log("Object data:", data);
    console.log("Converted data to array:", dataArray);
    console.log("Filtered data:", filteredData);
    console.log("Total:", total);
  }

  return (
    <>
      <Card className="h-80 w-full">
        <CardHeader>
          <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
            {/* You can place the title or additional content here */}
          </CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between gap-2">
          {total === 0 && (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              No data for the selected period
              <p className="text-sm text-muted-foreground">
                Try selecting a different period or try adding new{" "}
                {type === "income" ? "income" : "expense"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
