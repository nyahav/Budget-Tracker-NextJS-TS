import React, { useCallback, useEffect } from 'react'
import { TransactionType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Locations } from '@prisma/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import CreateLocationDialog from './CreateLocationDialog';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    type: TransactionType
    onChange: (value:string) => void

}

export function LocationPicker({ type,onChange }: Props) {
    const [open,setOpen] = React.useState(false);
    const [value,setValue] = React.useState("false");

    useEffect(()=>{
        if(!value) return;
        onChange(value);
    },[onChange,value])

    const locationsQuery = useQuery({
        queryKey: ["locations",type],
        queryFn: () => fetch(`/api/location-history?type=${type}`).then((res) => res.json()),
    });
    
    const selectLocation = locationsQuery.data?.find(
        (location :Locations) => location.name ===value
    );

    const onSuccessCallBack = useCallback((location: Locations) => {
        setValue(location.name);
        setOpen((prev) =>!prev);
    },[setValue,setOpen]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {selectLocation ? (
                <LocationRow location={selectLocation} />
              ) : (
                "Select location"
              )}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50'/>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
          <Command>
              <CommandList>
                <CommandInput placeholder="Search location..." />
                  <CreateLocationDialog type={type} successCallBack={onSuccessCallBack}/>
                  <CommandEmpty>
                    <p>Location not found</p>
                    <p className='text-xs text-muted-foreground'>
                        Tip:create a new location
                    </p>
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                        {locationsQuery.data && 
                        locationsQuery.data.map((location :Locations)=> (
                            <CommandItem
                            key={location.name}
                            onSelect={() => {
                                setValue(location.name);  
                                setOpen((prev) =>!prev);  
                            }}
                            className="flex items-center justify-between hover:bg-muted"
                        >
                            <LocationRow location={location} />
                            <Check
                                className={cn(
                                    "mr-2 w-4 h-4",
                                    value === location.name ? "opacity-100" : "opacity-0"
                                )}
                            />
                        </CommandItem>
                        ))}
                    </CommandList>
                  </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )
}

function LocationRow({location}:{location :Locations}){
    return <div className="flex items-center gap-2">
        <span role='img'>{location.icon}</span>
        <span>{location.name}</span>
    </div>
}