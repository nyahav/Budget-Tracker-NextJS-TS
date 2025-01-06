"use client"
import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Currencies, Currency } from "@/lib/currencries"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMutation, useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "./SkeletonWrapper"
import { UserSetting } from "@prisma/client"
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings"
import { toast } from "sonner"

export function CurrencryComboBox() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    null
  )
  const userSettings = useQuery<UserSetting>({
    queryKey: ["userSettings"],
    queryFn: ()=> fetch("/api/user-settings").then(res =>res.json()),
  })

  React.useEffect(()=> {
  if(!userSettings.data)return;
  const userCurrency = Currencies.find((currency) =>currency.value ===userSettings.data.currency);
  if (userCurrency) setSelectedOption(userCurrency);
  },[userSettings.data])

  const mutation = useMutation({
    mutationFn:UpdateUserCurrency,
    onSuccess: (data: UserSetting) => {
      toast.success('Currency updated successuflly🎉',{
        id:"update-currency",
      });
      setSelectedOption(
        Currencies.find(c =>c.value===data.currency) || null
      )
    },
    onError:(e) => {
      toast.error("Something went wrong"),{
        id:"update-currency",
      }
    }
  });
  const selectOption=React.useCallback((currency:Currency|null)=>{
    if(!currency){
      toast.error("please select a currency");
      return;
    }
    toast.loading("Updating currency...",{
      id:"update-currency",
    });
    mutation.mutate(currency.value)
  },[mutation]);

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start" disabled={mutation.isPending}>
            {selectedOption ? <>{selectedOption.label}</> : <>+ Set currency</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
        </PopoverContent>
      </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start" disabled={mutation.isPending}>
          {selectedOption ? <>{selectedOption.label}</> : <>+ Set currency</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
        </div>
      </DrawerContent>
    </Drawer>
    </SkeletonWrapper>
  )
}
interface OptionListProps {
    setOpen: (open: boolean) => void
    setSelectedOption: (currency: Currency | null) => void
  }
  
  function OptionList({ setOpen, setSelectedOption }: OptionListProps) {
    return (
      <Command>
        <CommandInput placeholder="Filter currency..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {Currencies.map((currency : Currency) => (
              <CommandItem
                key={currency.value}
                value={currency.value}
                onSelect={() => {
                  setSelectedOption(
                      Currencies.find((cur) => cur.value === currency.value) || null
                  )
                  setOpen(false)
                }}
              >
                {currency.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    )
  }