import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma'; // Import your Prisma client directly
import { GetUpdatedSearchResultsResponse } from '../../../lib/utils/dtos/responses.dto';
import { getTodayDateTime } from '@/lib/utils/helpers/getTodayDateTime';

/**
 * @swagger
 * /api/scrapper/update:
 *   post:
 *     summary: Update real estate search results
 *     description: This route allows updating the real estate data for an existing search based on the search ID.
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
 *                 description: The ID of the search whose data needs to be updated.
 *               requestParams:
 *                 type: object
 *                 description: Parameters for making a new request.
 *               previousData:
 *                 type: object
 *                 description: Previously fetched data for comparison.
 *     responses:
 *       200:
 *         description: Successfully updated search results.
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
 *         description: Invalid request body or missing data.
 *       503:
 *         description: Service unavailable, failed to fetch updated data.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { searchId, requestParams, previousData } = req.body;

    if (!searchId) {
      return res.status(400).json({ message: 'searchId is required' });
    }

    try {
      // Retrieve the existing search data from the database
      const document = await prisma.realEstate.findUnique({
        where: { id: searchId },
      });

      if (!document) {
        return res.status(404).json({ message: 'Search with provided ID not found' });
      }

      // Replace with your real estate fetching logic (API or scraping)
      const response = await fetchUpdatedRealEstateData(requestParams, previousData);

      // Update the document in the database with the new data
      await prisma.realEstate.update({
        where: { id: searchId },
        data: {
          items: response.feed_items,
          search_params: response.search_params,
          total_pages: response.total_pages,
          last_updated: getTodayDateTime(),
        },
      });

      // Send back the updated search results
      res.status(200).json({
        items: response.feed_items,
        search_params: response.search_params,
        total_pages: response.total_pages,
      } as GetUpdatedSearchResultsResponse);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// Placeholder for your actual logic to fetch the updated real estate data
async function fetchUpdatedRealEstateData(requestParams: any, previousData: any) {
  // Example fetching process from an external service or API
  const updatedData = {
    feed_items: [], // New real estate items
    search_params: requestParams, // Updated search parameters
    total_pages: 1, // New total pages count
  };

  // Logic to fetch updated data goes here (e.g., scraping, API calls, etc.)
  return updatedData;
}
