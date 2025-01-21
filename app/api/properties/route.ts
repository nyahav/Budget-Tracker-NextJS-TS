import { NextRequest, NextResponse } from 'next/server';
import { propertyHandler } from '@/app/services/propertyHandler';
import { ApiPurpose } from '@/lib/propertyType';

//swagger
/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Retrieve properties
 *     description: Fetch a paginated list of real estate properties based on purpose.
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: query
 *         name: purpose
 *         schema:
 *           type: string
 *           enum: [for-sale, for-rent]
 *         required: true
 *         description: Purpose of the property (e.g., for-sale or for-rent).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: The page number for pagination.
 *       - in: query
 *         name: hitsPerPage
 *         schema:
 *           type: integer
 *           default: 9
 *         required: false
 *         description: The number of properties to fetch per page.
 *     responses:
 *       200:
 *         description: Paginated list of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       price:
 *                         type: number
 *                       rooms:
 *                         type: integer
 *                       baths:
 *                         type: integer
 *                       area:
 *                         type: number
 *                       location:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             externalID:
 *                               type: string
 *                       description:
 *                         type: string
 *                       furnishingStatus:
 *                         type: string
 *                         enum: [furnished, unfurnished, partially-furnished]
 *                       rentFrequency:
 *                         type: string
 *                         enum: [yearly, monthly, weekly, daily]
 *                 nbHits:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Perform cleanup
 *     description: Close Redis connections and perform cleanup operations.
 *     tags:
 *       - Properties
 *     responses:
 *       200:
 *         description: Cleanup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Cleanup failed
 */

export async function GET(req: NextRequest) {
  try {
      // Check Redis connection health before proceeding
      const redisHealthy = await propertyHandler.checkRedisHealth();
      if (!redisHealthy) {
          console.warn('Redis connection is not healthy');
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