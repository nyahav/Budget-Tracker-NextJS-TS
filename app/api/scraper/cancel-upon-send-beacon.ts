import { NextApiRequest, NextApiResponse } from 'next';
import rawbody from 'raw-body';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/scrapper/cancel-upon-send-beacon:
 *   post:
 *     summary: Cancel a search upon client page unload
 *     description: This route handles the cancelation of a search when a "sendBeacon" request is made from the client during page unload.
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
 *                 description: The ID of the search to be canceled.
 *     responses:
 *       204:
 *         description: Successfully deleted the search data.
 *       400:
 *         description: Invalid search ID or missing search ID in the request body.
 *       404:
 *         description: Search with the provided search ID was not found.
 *       500:
 *         description: Server error, failed to cancel the search.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the raw body
      const raw = await rawbody(req);
      const text = raw.toString().trim();
      const json = JSON.parse(text);

      // Ensure the searchId is provided
      if (!json.searchId) {
        return res.status(400).json({ message: 'searchId is required' });
      }

      // Attempt to delete the document with the provided searchId
      const deletedDocument = await prisma.realEstate.delete({
        where: { id: json.searchId },
      });

      // If no document was found, return 404
      if (!deletedDocument) {
        return res.status(404).json({ message: 'Search with the provided search ID was not found' });
      }

      // Return a success response
      res.status(204).end(); // No content, as requested
    } catch (error) {
      // Catch any errors (e.g., Prisma-related issues)
      console.error('Error deleting document:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    // If method is not POST, return method not allowed
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
