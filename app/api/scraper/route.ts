import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/scrapper/route:
 *   get:
 *     summary: Placeholder route for routing purposes
 *     description: A placeholder for routing logic or redirects.
 *     tags:
 *       - Scrapper
 *     responses:
 *       200:
 *         description: Placeholder for route logic.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Insert new real estate document using Prisma
    const newDocument = await prisma.realEstate.create({
      data: {
        status: body.status,
        linkToken: body.linkToken,
        estateType: body.estateType,
        street: body.street,
        neighborhood: body.neighborhood,
        settlement: body.settlement,
        rooms: body.rooms,
        floor: body.floor,
        squareMeters: body.squareMeters,
        updatedAt: body.updatedAt,
        price: body.price,
        items: body.items,
        search_params: body.search_params,
        total_pages: body.total_pages,
        last_updated: body.last_updated,
      },
    });

    return NextResponse.json(newDocument);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
