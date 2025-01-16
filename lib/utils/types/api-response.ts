import { RealEstate } from './real-estate';

export interface ApiResponse {
  feed_items: RealEstate[];
  search_params: {
    [key: string]: any;
  };
  total_pages: number;
}
