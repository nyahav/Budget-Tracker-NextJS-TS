
import { NextResponse } from 'next/server';

const BASE_URL = 'https://rel-api.onrender.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'signup':
        const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const signupData = await signupResponse.json();
        return NextResponse.json(signupData);

      case 'signin':
        const signinResponse = await fetch(`${BASE_URL}/api/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const signinData = await signinResponse.json();
        return NextResponse.json(signinData);

      case 'signout':
        const signoutResponse = await fetch(`${BASE_URL}/api/signout`, {
          method: 'GET'
        });
        const signoutData = await signoutResponse.json();
        return NextResponse.json(signoutData);

      case 'createListing':
        const createListingResponse = await fetch(`${BASE_URL}/listings/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const createListingData = await createListingResponse.json();
        return NextResponse.json(createListingData);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const listingId = searchParams.get('listingId');

    switch (action) {
      case 'getListings':
        const startIndex = searchParams.get('startIndex');
        const listingsUrl = startIndex 
          ? `${BASE_URL}/listings?startIndex=${startIndex}`
          : `${BASE_URL}/listings`;
        const listingsResponse = await fetch(listingsUrl);
        const listingsData = await listingsResponse.json();
        console.log(listingsData);  
        return NextResponse.json(listingsData);

      case 'getUserListings':
        const userListingsResponse = await fetch(`${BASE_URL}/user/listings`);
        const userListingsData = await userListingsResponse.json();
        return NextResponse.json(userListingsData);

      case 'getListing':
        if (!listingId) {
          return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
        }
        const listingResponse = await fetch(`${BASE_URL}/user/listing/${listingId}`);
        const listingData = await listingResponse.json();
        return NextResponse.json(listingData);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}