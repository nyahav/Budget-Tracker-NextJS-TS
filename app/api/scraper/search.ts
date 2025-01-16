import { NextRequest } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { getTodayDateTime } from '@/lib/utils/helpers/getTodayDateTime'

type SearchParams = {
  dealType: 'forsale' | 'rent'
  settlement: string
  minPrice: number
  maxPrice: number
  page: number
}

type RealEstateItem = {
  linkToken: string
  estateType: string
  street: string
  neighborhood: string
  settlement: string
  rooms: number
  floor: number
  squareMeters: number
  updatedAt: string
  price: string
}

type SearchResponse = {
  search_id: string
  items: RealEstateItem[]
  total_pages: number
}

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const dealType = searchParams.get('dealType')
    const settlement = searchParams.get('settlement')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = searchParams.get('page') || '1'
    const saveToDb = searchParams.get('saveToDb')

    if (!dealType || !settlement || !minPrice || !maxPrice) {
      return Response.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const requestParams: SearchParams = {
      dealType: dealType as 'forsale' | 'rent',
      settlement,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      page: Number(page),
    }

    const response = await fetchInitialRealEstateData(requestParams)

    let searchId = ''

    if (saveToDb === 'true') {
      const realEstateData: Prisma.RealEstateCreateManyInput[] = response.items.map((item) => ({
        status: 'default',
        linkToken: item.linkToken, // Added missing linkToken
        estateType: requestParams.dealType,
        settlement: requestParams.settlement,
        street: item.street,
        neighborhood: item.neighborhood,
        rooms: item.rooms,
        floor: item.floor,
        squareMeters: item.squareMeters,
        updatedAt: getTodayDateTime(),
        price: item.price,
        createdAt: new Date(),
      }))

      const result = await prisma.realEstate.createMany({
        data: realEstateData,
      })

      searchId = result.count.toString()
    }

    const result: SearchResponse = {
      search_id: searchId,
      items: response.items,
      total_pages: response.total_pages,
    }

    return Response.json(result)
  } catch (error) {
    console.error('Search error:', error)
    return Response.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

async function fetchInitialRealEstateData(params: SearchParams): Promise<{
  items: RealEstateItem[]
  total_pages: number
}> {
  // Replace with actual API call
  return {
    items: [
      {
        linkToken: 'some-link-token',
        estateType: params.dealType,
        street: 'Main St',
        neighborhood: 'Downtown',
        settlement: params.settlement,
        rooms: 3,
        floor: 2,
        squareMeters: 80,
        updatedAt: getTodayDateTime(),
        price: '500,000',
      },
    ],
    total_pages: 10,
  }
}