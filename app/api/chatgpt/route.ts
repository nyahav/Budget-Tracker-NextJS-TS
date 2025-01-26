// app/api/property-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { realEstateAI } from '@/app/services/chatGPT';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received body:', body);
    
    const { query } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await realEstateAI.search(query);
    if (!results) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      );
    }


    console.log('Search result:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('AI Search API Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}