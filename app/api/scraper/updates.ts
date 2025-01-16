// pages/api/real-estate/updates.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { extractOnlyRealEstateData, removeDuplicates, detectChanges } from '@/lib/utils/helpers';
import { YAD2_REQUEST_HEADERS } from '@/lib/utils/constants';


/**
 * @swagger
 * /api/scrapper/updates:
 *   post:
 *     summary: Fetch and update search results
 *     description: This route fetches updated search results based on a provided search ID and updates the database.
 *     tags:
 *       - Scrapper
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchId:
 *                 type: string
 *                 description: The ID of the search whose results are to be updated.
 *               previousData:
 *                 type: object
 *                 description: The previous set of data for comparison.
 *     responses:
 *       200:
 *         description: Successfully updated the search results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feed_items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Property unique ID.
 *                       title:
 *                         type: string
 *                         description: Property title.
 *                       price:
 *                         type: number
 *                         description: Property price.
 *                 total_pages:
 *                   type: number
 *                   description: Total number of pages.
 *       400:
 *         description: Invalid request body or missing searchId.
 *       503:
 *         description: Service unavailable, failed to fetch updated data.
 */


export async function POST(req: NextRequest) {
    try {
        const { requestParams, previousData } = await req.json();

        // Fetch the updated real estate data from the Yad2 API using the cityCode from the request parameters
        const url = `${process.env.YAD2_REAL_ESTATE_REQUEST_URL}?cityCode=${requestParams.cityCode}`;
        const { data } = await axios.get(url, { headers: YAD2_REQUEST_HEADERS });

        // Process and clean the fetched data
        const realEstateData = extractOnlyRealEstateData(data);
        const uniqueRealEstateData = removeDuplicates(realEstateData);

        // Detect changes between the previous data and the newly fetched data
        const changedData = detectChanges(previousData.items, uniqueRealEstateData);

        // Return the updated data along with the search parameters and total pages
        return NextResponse.json({
            feed_items: changedData,
            search_params: previousData.search_params,
            total_pages: data.data.feed.total_pages,
        });
    } catch (error) {
        console.error('Error updating data:', error);
        return NextResponse.json({ message: 'Failed to fetch updated data' }, { status: 503 });
    }
}
