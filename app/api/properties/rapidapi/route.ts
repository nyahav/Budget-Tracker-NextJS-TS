// //api route handler,api endopoint for fetching properties and property details
// ////keeping it as seperation of concerns.
// import { NextResponse } from 'next/server';
// import { fetchProperties, fetchPropertyDetails } from '@/app/services/realEstate';
// import { PropertyPurpose } from '@/lib/types';
// import { prisma } from '@/lib/prisma';
// import redis from '@/app/services/redis';


// async function savePropertyToDb(property: any,purpose:PropertyPurpose) {
//   try {
//     if (!property || !property.id || !property.title) {
//       console.error('Invalid property data:', property);
//       throw new Error('Invalid property data');
//     }

//     // Check if property exists
//     const existingProperty = await prisma.property.findFirst({
//       where: {
//         id: property.id.toString(),
//       }
//     });

//     if (existingProperty) {
//       console.log('Property exists:', property.id);
//       return existingProperty;
//     }

//     const newProperty = await prisma.property.create({
//       data: {
//         id: property.id.toString(),
//         title: property.title,
//         purpose: purpose,
//         price: parseFloat(property.price) || 0,
//         rooms: property.rooms || 0,
//         baths: property.baths || 0,
//         area: property.area || 0,
//         rentFrequency: property.rentFrequency?.toUpperCase() || null,
//         location: property.location?.name || 'Unknown',
//         description: property.description || '',
//         furnishingStatus: property.furnishingStatus || null,
//       }
//     });

//     console.log('New property saved:', property.id);
//     return newProperty;
//   } catch (error) {
//     console.error('Error saving property:', error instanceof Error ? error.message : 'Unknown error');
//     throw error; // Re-throw to handle in calling function
//   }
// }

// async function fetchPropertyFromDb(id: string) {
//   try {
//     if (!id) {
//       console.error('Invalid property ID:', id);
//       throw new Error('Property ID is required');
//     }

//     // Fetch property from the database by ID
//     const property = await prisma.property.findUnique({
//       where: {
//         id: id.toString(),
//       },
//     });

//     if (!property) {
//       console.log('Property not found:', id);
//       return null; // Return null if the property doesn't exist
//     }

//     console.log('Property fetched:', property.id);
//     return property; // Return the fetched property
//   } catch (error) {
//     console.error('Error fetching property:', error instanceof Error ? error.message : 'Unknown error');
//     throw error; // Re-throw to handle in the calling function
//   }
// }

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const purpose = searchParams.get('purpose') as PropertyPurpose || 'FOR_SALE';
//     const propertyId = searchParams.get('propertyId');
//     const page = Number(searchParams.get('page')) || 1;
//     const hitsPerPage = Number(searchParams.get('hitsPerPage')) || 9;

//     console.log('API received request:', { purpose, page, hitsPerPage });
    
//     if (propertyId) {
//       const property = await fetchPropertyDetails(propertyId);
//       return NextResponse.json(property);
//     }
  
//     const properties = await fetchProperties(purpose, page, hitsPerPage);
//     console.log('Fetched properties:', {
//       total: properties.hits?.length,
//       currentPage: page
//     });
//     // Save properties to database
//     if (properties.hits?.length > 0) {
//       console.log('Saving properties:', properties.hits.length);
//       try {
//         await Promise.all(
//           properties.hits.map(async (property) => {
//             try {
//               return await savePropertyToDb(property,purpose);
//             } catch (err) {
//               console.error(`Failed to save property ${property?.id}:`, err);
//               return null;
//             }
//           })
//         );
//       } catch (err) {
//         console.error('Bulk save failed:', err);
//       }
//     }

//     return NextResponse.json({
//       hits: properties.hits || [],
//       nbHits: properties.nbHits || 0,
//       page,
//       hitsPerPage
//     });

//   } catch (error) {
//     console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');
//     return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
//   }
// }