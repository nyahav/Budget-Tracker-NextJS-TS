

import React from 'react'
import LocationsTable from './_components/LocationsTable'
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import CreateLocationDialog from '../_components/CreateLocationDialog';
import { Button } from '@/components/ui/button';

async function LocationPage() {
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
                <div className="flex items-center gap-3">
                    <CreateLocationDialog
                        
                        trigger={
                            <Button
                                variant="outline"
                                className="border-blue-500 bg-blue-950 text-white hover:bg-blue-700 hover:text-white"
                            >
                                New Location 🏠
                            </Button>
                        }
                    />
                </div>
                <LocationsTable />
            </div>
        </>

    )
}

export default LocationPage