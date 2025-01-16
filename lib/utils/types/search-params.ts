export interface SearchParams {
    dealType: 'forsale' | 'forrent'; // Adjust this as needed
    settlement: string;
    cityCode: string;
    minPrice: number;
    maxPrice: number;
    page: number;
  }
  