// app/api/property-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { realEstateAI } from '@/app/services/chatGPT';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await realEstateAI.search(query);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('AI Search API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process search query' },
      { status: 500 }
    );
  }
}