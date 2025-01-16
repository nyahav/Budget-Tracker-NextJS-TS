import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { removeDuplicates } from '@/lib/utils/helpers';
import { extractOnlyRealEstateData } from '@/lib/utils/helpers';
import { YAD2_REQUEST_HEADERS } from '@/lib/utils/constants';


/**
 * @swagger
 * /api/scrapper/initial:
 *   get:
 *     summary: Fetch initial search results
 *     description: Fetch the initial set of real estate search results from the external Yad2 API and return the data.
 *     tags:
 *       - Scrapper
 *     parameters:
 *       - in: query
 *         name: settlement
 *         schema:
 *           type: string
 *         description: The settlement (city or region) to search real estate in.
 *         required: true
 *       - in: query
 *         name: dealType
 *         schema:
 *           type: string
 *           enum: [forsale, rent]
 *         description: The type of deal (forsale or rent).
 *         required: true
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price for the property.
 *         required: true
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price for the property.
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully fetched the initial real estate search results.
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
 *                         description: Price of the property.
 *                 total_pages:
 *                   type: number
 *                   description: Total number of pages for the search.
 *       400:
 *         description: Missing required query parameters.
 *       503:
 *         description: Service unavailable, failed to fetch data.
 */



export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const settlement = searchParams.get('settlement');

        if (!settlement) {
            return NextResponse.json({ message: 'Settlement is required' }, { status: 400 });
        }

        const cityCode = await fetchCityCodeFromYad2(settlement);

        const url = `${process.env.YAD2_REAL_ESTATE_REQUEST_URL}?cityCode=${cityCode}`;
        const { data } = await axios.get(url, { headers: YAD2_REQUEST_HEADERS });

        const realEstateData = extractOnlyRealEstateData(data);
        const uniqueRealEstateData = removeDuplicates(realEstateData);

        return NextResponse.json({
            feed_items: uniqueRealEstateData,
            search_params: { settlement, cityCode },
            total_pages: data.data.feed.total_pages,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ message: 'Failed to fetch real estate data' }, { status: 503 });
    }
}

// Helper function to fetch city code
async function fetchCityCodeFromYad2(settlement: string): Promise<string> {
    const url = `${process.env.YAD2_SETTLEMENT_CODE_REQUEST_URL}?text=${encodeURIComponent(settlement)}`;
    const { data } = await axios.get(url, { headers: YAD2_REQUEST_HEADERS });

    if (!data.length) {
        throw new Error(`Settlement ${settlement} not found`);
    }

    return data[0].value.city;
}
