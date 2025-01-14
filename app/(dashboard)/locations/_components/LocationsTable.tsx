"use client"

import React, { useMemo, useState } from 'react'
import { DateToUTCDate } from '@/lib/helpers'
import { useQuery } from '@tanstack/react-query'
import { getTransactionHistoryResponseType } from '@/app/api/transaction-history/route'
import {download,generateCsv,mkConfig} from "export-to-csv"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
  } from "@tanstack/react-table"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import SkeletonWrapper from '@/components/SkeletonWrapper'
import { DataTableColumnHeader } from '@/components/datatable/ColumnHeader'
import { cn } from '@/lib/utils'
import { map } from 'zod'
import { DataTableFacetedFilter } from '@/components/datatable/FacetedFilter'
import { DataTableViewOptions } from '@/components/datatable/ColumnToggle'
import { Button } from '@/components/ui/button'
import { DownloadIcon, MoreHorizontal, TrashIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteLocationDialog from './DeleteLocationDialog'
import { getLocationsHistoryResponseType } from '@/app/api/location-history/route'


const emptyData: LocationData[] = [];
type LocationHistoryRow = getLocationsHistoryResponseType[0];

const columns: ColumnDef<LocationData>[] = [
    {
        accessorKey: "address",
        header: ({column}) => (                   
            <DataTableColumnHeader column={column} title="Location"/>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({row}) => (
            <div className="flex gap-2 capitalize">
                {row.original.id}
                <div className="capitalize">
                    {row.original.address}
                </div>
            </div>
        )
    },
   
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({row}) => {
            const date = new Date(row.original.createdAt);
            const formattedDate = date.toLocaleDateString("default", {
                timeZone: "UTC",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            })
            return (
                <div className="text-muted-foreground">
                    {formattedDate}
                </div>
            )
        }
    },
    
    {
        id: "actions",
        enableHiding: false,
        cell: ({row}) => (
            <RowActions location={row.original}/>
        )
    }
];

type LocationData = {
    formattedPurchasePrice: string;
    formattedCurrentValue: string;
    formattedMonthlyRent: string;
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    squareFeet: number;
    bedrooms: number;
    yearBuilt: number;
    purchasePrice: number;
    currentValue: number;
    monthlyRent: number | null | undefined;
    propertyType: string;
    status: string;
  }

// const csvConfig = mkConfig({
//   fieldSeparator: ",",
//   decimalSeparator: ".",
//   useKeysAsHeaders: true,
//   columnHeaders: [
//     "Address",
//     "City",
//     "State",
//     "Zip Code",
//     "Square Feet",
//     "Bedrooms",
//     "Year Built",
//     "Purchase Price",
//     "Current Value",
//     "Monthly Rent",
//     "Property Type",
//     "Status"
//   ]
// });



export const propertyTypeOptions = [
    { value: "house", label: "House" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo" },
    { value: "land", label: "Land" },
    { value: "commercial", label: "Commercial" }
  ] as const;


function LocationsTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
    const { data, isLoading, isError, error } = useQuery<LocationData[]>({
      queryKey: ["location", "history"],
      queryFn: async () => {
          const response = await fetch('/api/location-history');
          if (!response.ok) {
              throw new Error(`API Error: ${response.statusText}`);
          }
          const data = await response.json();
          console.log("Fetched data:", data); // Debug log
          return data;
      },
      retry: 1,
  });

  console.log("Query state:", { data, isLoading, isError, error });

    // const handleExportCsv = (data:any[])=>{
    //   const csv =generateCsv(csvConfig)(data);
    //   download(csvConfig)(csv);
    // }

    const table = useReactTable<LocationData>({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
          sorting,
          columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableColumnFilters: true,
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
          pagination: {
            pageSize: 10,
            pageIndex: 0
          }
        }
    })

    if (isError) {
      return (
          <div className="w-full p-4 text-red-500">
              Error loading locations: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
      );
  }

  if (isLoading) {
      return <SkeletonWrapper isLoading={true}>
          <div className="h-96"></div>
      </SkeletonWrapper>;
  }


  if (!data || data.length === 0) {
    return (
        <div className="w-full">
            <div className="flex flex-wrap items-end justify-between gap-2 py-4">
                <div className="flex flex-wrap gap-2">
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            <div className="rounded-md border">
                <p className="text-center py-8 text-muted-foreground">No locations found.</p>
            </div>
        </div>
    );
}

// Show data
return (
    <div className="w-full">
        <div className="flex flex-wrap items-end justify-between gap-2 py-4">
            <div className="flex flex-wrap gap-2">
                <DataTableViewOptions table={table} />
            </div>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
        </div>
    </div>
);
}

export default LocationsTable

function RowActions({ location }: { location: LocationData }) {
    const [showDeleteDialog, setshowDeleteDialog] = useState(false);
    return (
      <>
        <DeleteLocationDialog 
          open={showDeleteDialog} 
          setOpen={setshowDeleteDialog} 
          locationId={location.id}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem 
              className="flex items-center gap-2" 
              onSelect={() => setshowDeleteDialog(prev => !prev)}
            >
              <TrashIcon className="h-4 w-4 text-muted-foreground"/>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }