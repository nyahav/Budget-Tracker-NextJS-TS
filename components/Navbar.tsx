"use client";
import React, { useState } from 'react';
import Logo, { LogoMobile } from '@/components/Logo';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from './ui/button';
import { UserButton } from '@clerk/nextjs';
import { ThemeSwitcherBtn } from './ThemeSwitcherBtn';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  
function Navbar() {
  return (
    <>
    <DesktopNavbar/>
    <MobileNavbar />
    </>
  )
}


const items =[
    {label: "Dashboard", link: "/"},
    {label: "Transactions", link: "/transactions"},
    {label: "Locations", link: "/locations"},
    {label: "Manage", link: "/manage"},
    {
        label: "Search",
        submenu: [
          { label: "Search To Buy", link: "/searchBuy" },
          { label: "Search To Rent", link: "/searchRent" },
        ],
      },
]

function MobileNavbar(){
    const [isOpen,setIsOpen] =useState(false);
    return (
        <div className='block border-separate bg-background md:hidden'>
            <nav className='container flex items-center justify-between px-8'>
                <Sheet open={isOpen} onOpenChange={setIsOpen} > 
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <Menu/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent className='w-[400px] sm:w-[540px]' side="left">
                        <Logo/>
                        <div className="flex flex-col gap-1 pt-4">
                            {items.map(item => <NavbarItem 
                            key={item.label} 
                            link={item.link ?? '#'}
                            label={item.label}
                            onClick={()=>setIsOpen((prev)=>!prev)}
                            />
                        )}
                        </div>
                    </SheetContent>
                </Sheet>
                <div className='flex h-[80px] min-h-[60px] items-center gap-x-4'>
                    <LogoMobile/>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitcherBtn />
                    <UserButton afterSwitchSessionUrl='/sign-in'/>
                </div>
            </nav>
        </div>
    )
}
function DesktopNavbar() {
    return (
      <nav className="hidden md:block">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            {items.map((item) => 
              item.submenu ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className="hover:text-primary">
                    {item.label}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.submenu.map((subItem) => (
                      <DropdownMenuItem key={subItem.label}>
                        <Link href={subItem.link} className="w-full ">
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavbarItem
                  key={item.label}
                  label={item.label}
                  link={item.link}
                />
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcherBtn />
            <UserButton afterSwitchSessionUrl="/sign-in" />
          </div>
        </div>
      </nav>
    )
  }

function NavbarItem ({ link, label, onClick }: { link: string; label: string; onClick?: () => void }){
    const pathname = usePathname();
    const isActive = pathname === link;

    return <div className="relative flex items-center">
        <Link href={link} className={cn(
            buttonVariants({variant:"ghost"}),
            "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
            isActive && "text-foreground"
        )}
        onClick={() => {
            if(onClick) onClick();
        }}
        >{label}</Link>
        {
            isActive && (
                <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block">
                </div>
            )
        }
    </div>
}
export default Navbar