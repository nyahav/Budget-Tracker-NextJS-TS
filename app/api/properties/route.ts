import { NextRequest, NextResponse } from 'next/server';
import { propertyHandler } from '@/app/services/propertyHandler';
import { ApiPurpose } from '@/lib/propertyType';

export async function GET(req: NextRequest) {
  try {
      // Check Redis connection health before proceeding
      const redisHealthy = await propertyHandler.checkRedisHealth();
      if (!redisHealthy) {
          console.warn('Redis connection is not healthy');
          // Continue anyway as we can fall back to DB
      }

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

// Add cleanup route in the same directory
export async function DELETE(req: NextRequest) {
    try {
        await propertyHandler.close();
        return NextResponse.json({ message: 'Cleanup successful' });
    } catch (error) {
        console.error('Cleanup Error:', error);
        return NextResponse.json(
            { error: 'Cleanup failed' },
            { status: 500 }
        );
    }
}