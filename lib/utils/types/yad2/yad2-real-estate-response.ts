// utils/types/yad2-real-estate-response.ts
import {  Yad2RealEstateItem } from './yad2-real-estate-item';
import {Yad2AdvertisementItem} from './yad2-advertisemnt-item';
/**
 * Represents the response from the Yad2 API for real estate data.
 */
export type Yad2RealEstateResponse = {
  /** The data returned by the API. */
  data: {
    /** The feed object containing the feed items and total pages. */
    feed: {
      /** An array of feed items, each containing data of a real estate property. */
      feed_items: (Yad2RealEstateItem | Yad2AdvertisementItem)[];

      /** The current page of the feed. */
      current_page: number;

      /** The total number of pages containing feed items. */
      total_pages: number;

      /** Any additional properties returned by the API. */
      [key: string]: unknown;
    };

    /** Any additional properties returned by the API. */
    [key: string]: unknown;
  };

  /** Any additional properties returned by the API. */
  [key: string]: unknown;
};

/**
 * Represents the response for city codes from the Yad2 API.
 */
export type Yad2CityCodeResponse = {
  /** The data returned by the API, which contains various codes. */
  value: {
    /** The city code of the city. */
    city: string;

    /** Additional codes that may be present in this data object. */
    [key: string]: unknown;
  };

  /** Additional properties that may be present in this data object. */
  [key: string]: unknown;
};
