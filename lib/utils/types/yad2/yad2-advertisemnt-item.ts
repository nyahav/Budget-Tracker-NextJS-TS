/** Represents a data transfer object for a Yad2 advertisement. */
export type Yad2AdvertisementItem = {
    /** The data in the advertisement. */
    [key: string]: unknown;
}

/** Represents the rooms data of a real estate property. */
type RoomsData = {
    /** Represents the number of rooms in the real estate property. */
    value: number;

    /** Additional properties that may be present in the data object. */
    [key: string]: unknown;
}