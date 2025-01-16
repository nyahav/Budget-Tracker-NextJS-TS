// utils/types/yad2-real-estate-item.ts

export type Yad2RealEstateItem = {
    /** The ID of the real estate. Also serves as a link token to the item's detailed page. */
    id: string;
  
    /** The address of the real estate. */
    title_1: string;
  
    /** The neighborhood of the real estate. */
    neighborhood: string;
  
    /** The city of the real estate. */
    city: string;
  
    /** The type of real estate asset (e.g. apartment, house, etc.). */
    title_2: string;
  
    /** The basic data of the real estate (e.g. number of rooms, floor, and square meters). */
    row_4: [
      RoomsData,
      FloorData,
      SquareMetersData
    ];
  
    /** 
     * The date the feed item was last updated. 
     * @remarks It comes as a string in the format of 'YYYY-MM-DD HH:MM:SS'. Can be converted to a Date object using new Date(dateString).
    */
    date: string;
  
    /** The price of the real estate. */
    price: string;
  
    /** The type of the feed item (e.g. 'תיווך' for real estate agents). */
    highlight_text: string;
  
    /** Additional data of the real estate. */
    [key: string]: unknown;
  }
  
  export type RoomsData = {
    /** Represents the number of rooms in the real estate property. */
    value: number;
  
    /** Additional properties that may be present in the data object. */
    [key: string]: unknown;
  }
  
  export type FloorData = {
    /** Represents the floor number of the real estate property (note: this can also be a string because floor 0 is represented as 'קרקע'). */
    value: string | number;
  
    /** Additional properties that may be present in the data object. */
    [key: string]: unknown;
  }
  
  export type SquareMetersData = {
    /** Represents the square meters of the real estate property. */
    value: number;
  
    /** Additional properties that may be present in the data object. */
    [key: string]: unknown;
  }
  