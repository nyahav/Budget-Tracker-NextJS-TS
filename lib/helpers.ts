import { Currencies } from "./currencries"

export function DateToUTCDate(date: Date){
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMilliseconds()
        )
    )
}


export function GetFormatterForCurrency(currency: string)
{
    const locale = Currencies.find(c => c.value === currency)?.locale

    return new Intl.NumberFormat(locale,{
        style: "currency",
        currency,
    })
}