import { RealEstate } from './real-estate';
import { SearchParams } from './search-params';

export interface GetInitialSearchResultsResponse {
  /** The ID of the real estate filtered search. Will serve as a token to fetch more updated data on the same search. */
  search_id: string;

  /** The real estate items in the response. */
  items: RealEstate[];

  /** The total number of pages that real estate items can be fetched from. */
  total_pages: number;
}
