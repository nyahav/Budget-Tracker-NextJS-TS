export const Currencies = 
[
    {value: "USD",label:"$ Dollar",locale:"en-US"},
    {value: "GBP",label:"£ Pound",locale:"en-GB"},
    {value: "EUR",label:"€ Euro",locale:"de-DE"},
    {value: "JPY",label:"¥ Yen",locale:"ja-JP"},
    { value: "NIS", label: "₪ Shekel", locale: "he-IL" },
];

export type Currency = (typeof Currencies)[0];