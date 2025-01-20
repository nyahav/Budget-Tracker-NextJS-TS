import { NextRequest, NextResponse } from 'next/server';
import { propertyHandler } from '@/app/services/propertyHandler';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const purpose = searchParams.get('purpose') as 'for-sale' | 'for-rent';
    const page = parseInt(searchParams.get('page') || '1');
    const hitsPerPage = parseInt(searchParams.get('hitsPerPage') || '9');

    const { hits, nbHits } = await propertyHandler.getProperties(purpose, page, hitsPerPage);
    console.log('Route Response:', {
      totalItems: nbHits,
      totalPages: Math.ceil(nbHits / hitsPerPage),
      currentPage: page,
      itemsPerPage: hitsPerPage
  });
    return NextResponse.json({
      hits,
      nbHits,
      currentPage: page,
      totalPages: Math.ceil(nbHits / hitsPerPage)
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}