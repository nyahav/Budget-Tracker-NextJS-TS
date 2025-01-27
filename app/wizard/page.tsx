
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { CurrencryComboBox } from '@/components/CurrencryComboBox';
import { ClientThemeSelector } from '@/components/ClientThemeSelector';

async function page() {

    const user = await currentUser();
    if(!user){
        redirect("/sign-up")
    }
  return (
    <div className='container flex max-w-2xl flex-col items-center justify-between gap-4'>
        {user?.firstName ? (
        <h1 className='text-center text-3xl'>
            Welcome, <span className='ml-2 font-bold'>{user.firstName}! 👋</span>
        </h1>
        ) : null}
        <h2 className='mt-4 text-center text-base text-muted-foreground'>Before you add your properties and start managing your expenses,<br /> let's walk through our onboarding process.</h2>
        <h2 className='mt-4 text-center text-base text-muted-foreground'>Let&apos;s get started by setting up your currency</h2>
        
        <Separator/>
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Currency</CardTitle>
                <CardDescription>Set your default currency for transactions</CardDescription>
            </CardHeader>
            <CardContent>
                <CurrencryComboBox />
            </CardContent>
        </Card>
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Choose your theme</CardTitle>
                <CardDescription>Set your defualt theme preference</CardDescription>
            </CardHeader>
            <CardContent>
                <ClientThemeSelector />
            </CardContent>
        </Card>
        <Separator/>
        <Button className='w-full' asChild>
            <Link href='/'>I&apos;m done! Take me to the Dashboard</Link>
        </Button>
        <div className="mt-8"><Logo/></div>
    </div>
  )
}

export default page