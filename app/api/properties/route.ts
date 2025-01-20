import { NextRequest, NextResponse } from 'next/server';
import { propertyHandler } from '@/app/services/propertyHandler';
import { ApiPurpose } from '@/lib/propertyType';

export async function GET(req: NextRequest) {
  try {
      const searchParams = req.nextUrl.searchParams;
      const purpose = searchParams.get('purpose') as ApiPurpose;
      const page = parseInt(searchParams.get('page') || '1');
      const hitsPerPage = parseInt(searchParams.get('hitsPerPage') || '9');

      const { hits, nbHits, total } = await propertyHandler.getProperties(
          purpose, 
          page, 
          hitsPerPage
      );
      
      return NextResponse.json({
          hits,
          nbHits,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / hitsPerPage)
      });
  } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
          { error: 'Failed to fetch properties' },
          { status: 500 }
      );
  }
}