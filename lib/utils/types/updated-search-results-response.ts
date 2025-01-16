import { RealEstate } from './real-estate';
import { SearchParams } from './search-params';

export interface GetUpdatedSearchResultsResponse {
  /** The real estate items in the response. */
  items: RealEstate[];

  /** The search filter that was used and will be used to fetch updated data. */
  search_params: SearchParams;

  /** The total number of pages that real estate items can be fetched from. */
  total_pages: number;
}
