// import { redis } from './redis';
// import { realEstate, PropertyPurpose } from './realEstate';
// import { s3 } from './s3';
// import { prisma } from '@/lib/prisma';
// import { PropertyKind } from '@/lib/types';
// import { 
//   APIProperty, 
//   DBProperty, 
//   dbToApiProperty, 
//   apiToDbProperty, 
//   Purpose, 
//   RentFrequency 
// } from '@/lib/propertyType';

// export class PropertyHandler {
//   private readonly CACHE_TTL = 3600; // 1 hour in seconds
//   private readonly ITEMS_PER_PAGE = 9; // 3*3 grid

//   private convertPurposeFormat(purpose: PropertyPurpose): PropertyKind {
//     const purposeMapping: Record<PropertyPurpose, PropertyKind> = {
//       for_sale: 'buy',
//       for_rent: 'rent',
//     };
//     return purposeMapping[purpose];
//   }

//   public async getProperties(
//     purpose: PropertyPurpose,
//     page: number,
//     hitsPerPage: number = this.ITEMS_PER_PAGE
//   ): Promise<{ hits: DBProperty[]; nbHits: number }> {
//     try {
//       // Get from cache first
//       const cachedData = await redis.getFromCache(purpose, page);
//       if (cachedData && Array.isArray(cachedData)) {
//         const totalCount = await this.getTotalPropertiesCount(purpose);
//         return {
//           hits: cachedData as DBProperty[],
//           nbHits: totalCount
//         };
//       }

//       // Get from DB
//       const dbProperties = await this.getPropertiesFromDB(purpose, page, hitsPerPage);
//       if (dbProperties.length > 0) {
//         // Cache the database results
//         await redis.setInCache(purpose, page, dbProperties);
        
//         const totalCount = await this.getTotalPropertiesCount(purpose);
//         return {
//           hits: dbProperties,
//           nbHits: totalCount
//         };
//       }

//       // Fetch from API and process
//       const apiProperties = await this.fetchFromAPI(purpose, page, hitsPerPage);
//       const processedProperties = await this.processPropertiesImages(apiProperties, purpose);
//       const dbFormattedProperties = await this.storePropertiesInDB(processedProperties);

//       // Cache the results
//       await redis.setInCache(purpose, page, dbFormattedProperties);

//       return {
//         hits: dbFormattedProperties,
//         nbHits: await this.getTotalPropertiesCount(purpose)
//       };
//     } catch (error) {
//       console.error('Error in getProperties:', error);
//       throw new Error(`Failed to fetch properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   private async getPropertiesFromDB(
//     purpose: PropertyPurpose,
//     page: number,
//     hitsPerPage: number,
//     cachedIds?: string[]
//   ): Promise<DBProperty[]> {
//     try {
//       if (cachedIds?.length) {
//         const properties = await prisma.property.findMany({
//           where: {
//             id: {
//               in: cachedIds
//             }
//           }
//         });

//         return this.sortPropertiesByIds(properties, cachedIds);
//       }

//       const properties = await prisma.property.findMany({
//         where: { purpose },
//         skip: (page - 1) * hitsPerPage,
//         take: hitsPerPage,
//         orderBy: { createdAt: 'desc' }
//       });

//       // Ensure proper type casting for each property
//       return properties.map(prop => ({
//         ...prop,
//         purpose: prop.purpose as Purpose,
//         rentFrequency: prop.rentFrequency as RentFrequency | null,
//         createdAt: new Date(prop.createdAt),
//         updatedAt: new Date(prop.updatedAt)
//       }));
//     } catch (error) {
//       console.error('Error fetching properties from DB:', error);
//       throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   private sortPropertiesByIds(properties: DBProperty[], ids: string[]): DBProperty[] {
//     return ids
//       .map(id => properties.find(prop => prop.id === id))
//       .filter((prop): prop is DBProperty => prop !== undefined)
//       .map(prop => ({
//         ...prop,
//         purpose: prop.purpose as Purpose,
//         rentFrequency: prop.rentFrequency as RentFrequency | null
//       }));
//   }

//   private async getTotalPropertiesCount(purpose: PropertyPurpose): Promise<number> {
//     try {
//       return await prisma.property.count({ where: { purpose } });
//     } catch (error) {
//       console.error('Error counting properties:', error);
//       throw new Error(`Failed to count properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   private async processPropertiesImages(
//     properties: APIProperty[],
//     purpose: PropertyPurpose
//   ): Promise<DBProperty[]> {
//     const s3Purpose = this.convertPurposeFormat(purpose);

//     return Promise.all(
//       properties.map(async (property) => {
//         let imageUrl = property.coverPhoto?.url || '';

//         if (imageUrl) {
//           try {
//             const exists = await s3.checkImageExistsInS3(property.id, s3Purpose);
//             if (!exists) {
//               await s3.uploadImageToS3(property.id, imageUrl, s3Purpose);
//             }
//             imageUrl = (await s3.getImageUrl(property.id, s3Purpose)) || imageUrl;
//           } catch (err) {
//             console.error('Error processing image:', property.id, err);
//           }
//         }

//         return this.convertToDBProperty(property, purpose, imageUrl);
//       })
//     );
//   }

//   private convertToDBProperty(
//     property: APIProperty,
//     purpose: PropertyPurpose,
//     imageUrl: string
//   ): DBProperty {
//     return {
//       id: property.id,
//       title: property.title,
//       purpose: purpose,
//       price: property.price,
//       rooms: property.rooms,
//       baths: property.baths,
//       area: property.area,
//       rentFrequency: property.rentFrequency?.toUpperCase() as RentFrequency || null,
//       location: property.location?.[0]?.name || 'Unknown',
//       description: property.description,
//       furnishingStatus: property.furnishingStatus || null,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//   }

//   private async storePropertiesInDB(properties: DBProperty[]): Promise<DBProperty[]> {
//     try {
//       return await Promise.all(
//         properties.map(async (property) => {
//           return await prisma.property.upsert({
//             where: { id: property.id },
//             update: {
//               ...property,
//               updatedAt: new Date()
//             },
//             create: property
//           });
//         })
//       );
//     } catch (error) {
//       console.error('Error storing properties in DB:', error);
//       throw new Error(`Failed to store properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   private async fetchFromAPI(
//     purpose: PropertyPurpose,
//     page: number,
//     hitsPerPage: number
//   ): Promise<APIProperty[]> {
//     try {
//       // Implement your API fetching logic here
//       return [];
//     } catch (error) {
//       console.error('Error fetching from API:', error);
//       throw new Error(`API fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
// }

// export default PropertyHandler;
// export const propertyHandler = new PropertyHandler();