//service file handles the business logic of the application. 
// It fetches data from the API 
//keeping it as seperation of concerns.


import { z } from 'zod';
import { Property,DBPurpose, ApiPurpose, APIProperty } from '@/lib/propertyType';

// Types for API response
export interface PropertyResponse {
  hits: APIProperty[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export class RealEstateService {
  private readonly apiKey: string;
  private readonly apiHost: string;

  constructor() {
    // Validate environment variables
    if (!process.env.RAPID_API_KEY || !process.env.RAPID_API_HOST) {
      throw new Error('Missing RAPID_API environment variables');
    }

    this.apiKey = process.env.RAPID_API_KEY;
    this.apiHost = process.env.RAPID_API_HOST;
  }

  private getRequestOptions(): RequestInit {
    return {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': this.apiHost,
        'Content-Type': 'application/json',
      },
    };
  }
  async fetchProperties(
    purpose: ApiPurpose,
    page = 1,
    hitsPerPage = 9
  ): Promise<PropertyResponse> {
    console.log('Fetching properties:', { purpose, page, hitsPerPage });
    //need to convert cause of api rules
    //purpose === 'for-rent' ? 'for-rent' : 'for-sale';
    const url = `https://${this.apiHost}/properties/list?locationExternalIDs=5002&purpose=${purpose}&hitsPerPage=${hitsPerPage}&page=${page - 1}`;
    console.log('Requesting URL:', url);

    try {
      const response = await fetch(url, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      console.log('API response:', response.status);
      const data = await response.json();
      
      console.log('API response:', {
        total: data.nbHits,
        currentPage: data.page
      });

      return data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async fetchPropertyDetails(externalID: string): Promise<any> {
    const url = `https://${this.apiHost}/properties/detail?externalID=${externalID}`;

    try {
      const response = await fetch(url, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const realEstate = new RealEstateService();

// Export class for cases where a new instance is needed
export default RealEstateService;