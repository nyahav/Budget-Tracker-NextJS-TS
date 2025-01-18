//api route handler,api endopoint for fetching properties and property details
////keeping it as seperation of concerns.
import { NextResponse } from 'next/server';
import { fetchProperties, fetchPropertyDetails } from '@/app/services/realEstate';
import { PropertyPurpose } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get('purpose') as PropertyPurpose || 'for-sale';
    const propertyId = searchParams.get('propertyId');
    const page = Number(searchParams.get('page')) || 1;
    const hitsPerPage = Number(searchParams.get('hitsPerPage')) || 9;

    console.log('API received request:', { purpose, page, hitsPerPage });

    if (propertyId) {
      const property = await fetchPropertyDetails(propertyId);
      return NextResponse.json(property);
    }

    const properties = await fetchProperties(purpose, page, hitsPerPage);
    console.log('Fetched properties:', {
      total: properties.hits?.length,
      currentPage: page
    });

    return NextResponse.json({
      hits: properties.hits || [],
      nbHits: properties.nbHits || 0,
      page,
      hitsPerPage
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}