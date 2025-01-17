import { z } from 'zod';

// Validate environment variables
if (!process.env.RAPID_API_KEY || !process.env.RAPID_API_HOST) {
  throw new Error('Missing RAPID_API environment variables');
}

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = process.env.RAPID_API_HOST;

// Types for API response
interface PropertyResponse {
  hits: Array<any>;
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export const fetchProperties = async (
  purpose = 'for-rent', 
  page = 1, 
  hitsPerPage = 9
): Promise<PropertyResponse> => {
  console.log('Fetching properties:', { purpose, page, hitsPerPage });
  
  const url = `https://${RAPID_API_HOST}/properties/list?locationExternalIDs=5002&purpose=${purpose}&hitsPerPage=${hitsPerPage}&page=${page - 1}`;
  
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
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
};

export const fetchPropertyDetails = async (externalID: string) => {
  const url = `https://${RAPID_API_HOST}/properties/detail?externalID=${externalID}`;

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST,
      'Content-Type': 'application/json',
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};