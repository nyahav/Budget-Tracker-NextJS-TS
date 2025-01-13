"use client"

import React from 'react'
import LocationsTable from './_components/LocationsTable'
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

async function page() {
  return (
    <>
    <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
            <div >
                <p className="text-3xl font-bold">Locations</p>
                <p className="text-muted-foreground">Manage your properties and locations</p>
            </div>
        </div>
    </div>
    {/**END HEADER */}
    <div className="container flex flex-col gap-4 p-4">
    
        <LocationsTable />
    </div>
    </>

  )
}

export default page