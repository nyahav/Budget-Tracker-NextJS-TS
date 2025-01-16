import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma'; // Make sure this imports your Prisma client

/**
 * @swagger
 * /api/scrapper/cancel:
 *   delete:
 *     summary: Cancel a search and remove the associated data
 *     description: This route deletes the search results associated with a given search ID from the database.
 *     tags:
 *       - Scrapper
 *     parameters:
 *       - in: query
 *         name: searchId
 *         schema:
 *           type: string
 *         description: The ID of the search to be canceled.
 *         required: true
 *     responses:
 *       204:
 *         description: Successfully deleted the search and its associated data.
 *       400:
 *         description: Invalid search ID or missing search ID parameter.
 *       404:
 *         description: Search with the provided search ID was not found.
 *       500:
 *         description: Server error, failed to cancel the search.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { searchId } = req.query;

    if (!searchId) {
      return res.status(400).json({ message: 'searchId is required' });
    }

    try {
      // Use Prisma to delete the record from the real estate table
      const deleted = await prisma.realEstate.delete({
        where: {
          id: searchId as string,
        },
      });

      // If no record is deleted, return a 404 (not found)
      if (!deleted) {
        return res.status(404).json({ message: 'Search not found' });
      }

      res.status(204).end(); // No content, as requested.
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
