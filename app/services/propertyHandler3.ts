// import { redis } from './redis';
// import { realEstate, PropertyPurpose } from './realEstate';
// import { s3 } from './s3';
// import { prisma } from '@/lib/prisma';
// import { PropertyKind } from '@/lib/types';
// import { APIProperty, DBProperty, dbToApiProperty, apiToDbProperty, Purpose, RentFrequency } from '@/lib/propertyType';

// export class PropertyHandler {
//   private readonly CACHE_TTL = 3600; // 1 hour in seconds
//   private readonly ITEMS_PER_PAGE = 9; //3*3 grid

//   private getCacheKey(purpose: PropertyPurpose, page: number): string {
//     return `properties:${purpose}:page:${page}`;
//   }

//   private convertPurposeFormat(purpose: PropertyPurpose): PropertyKind {
//     const purposeMapping: Record<PropertyPurpose, PropertyKind> = {
//       for_sale: 'buy',
//       for_rent: 'rent',
//     };
//     return purposeMapping[purpose];
//   }

//   static async getProperties(
//     purpose: PropertyPurpose,
//     page: number,
//     hitsPerPage: number
//   ): Promise<{ hits: DBProperty[]; nbHits: number }> {
//     try {
//       // Get from cache first
//       const cachedData = await redis.getFromCache(purpose, page);
//       if (cachedData) {
//         return {
//           hits: cachedData,
//           const handlerInstance = new PropertyHandler();
//           nbHits: await handlerInstance.getTotalPropertiesCount(purpose)
//         };
//       }

//       // Get from DB
//       const dbProperties = await this.getPropertiesFromDB(purpose, page, hitsPerPage);
//       if (dbProperties.length > 0) {
//         return {
//           hits: dbProperties,
//           nbHits: await handlerInstance.getTotalPropertiesCount(purpose)
//         };
//       }

//       // Fetch from API and process
//       const apiProperties = await this.fetchFromAPI(purpose, page, hitsPerPage);
//       const handlerInstance = new PropertyHandler();
//       const processedProperties = await handlerInstance.processPropertiesImages(apiProperties, purpose);
//       const dbFormattedProperties = await handlerInstance.storePropertiesInDB(processedProperties);

//       return {
//         hits: dbFormattedProperties,
//         nbHits: apiProperties.length
//       };
//     } catch (error) {
//       console.error('Error in getProperties:', error);
//       throw error;
//     }
//   }

//   private async getPropertiesFromDB(
//     purpose: PropertyPurpose,
//     page: number,
//     hitsPerPage: number,
//     cachedIds?: string[]
// ): Promise<DBProperty[]> {
//     try {
//         if (cachedIds?.length) {
//             const properties = await prisma.property.findMany({
//                 where: {
//                     id: {
//                         in: cachedIds
//                     }
//                 }
//             });

//             // Ensure type safety and handle undefined values
//             return cachedIds
//                 .map(id => properties.find(prop => prop.id === id))
//                 .filter((prop): prop is NonNullable<typeof prop> => prop !== undefined)
//                 .map(prop => ({
//                     ...prop,
//                     purpose: prop.purpose as Purpose,
//                     rentFrequency: prop.rentFrequency as RentFrequency | null
//                 }));
//         }

//         const properties = await prisma.property.findMany({
//             where: { purpose },
//             skip: (page - 1) * hitsPerPage,
//             take: hitsPerPage,
//             orderBy: { createdAt: 'desc' }
//         });

//         return properties.map(prop => ({
//             ...prop,
//             purpose: prop.purpose as Purpose,
//             rentFrequency: prop.rentFrequency as RentFrequency | null
//         }));
//     } catch (error) {
//         console.error('Error fetching properties from DB:', error);
//         throw error;
//     }
// }

//   private async getTotalPropertiesCount(purpose: PropertyPurpose): Promise<number> {
//     return prisma.property.count({ where: { purpose } });
//   }

//   private async cachePropertyIds(
//     purpose: PropertyPurpose,
//     page: number,
//     properties: APIProperty[]
//   ): Promise<void> {
//     const propertyIds = properties.map((prop, index) => ({
//       serialNumber: (page - 1) * this.ITEMS_PER_PAGE + index + 1,
//       id: prop.id
//     }));

//     await redis.setInCache(purpose, page, propertyIds);
//   }

//   private async processPropertiesImages(
//     properties: APIProperty[],
//     purpose: PropertyPurpose
//   ): Promise<DBProperty[]> {
//     const s3Purpose = this.convertPurposeFormat(purpose);

//     return Promise.all(
//       properties.map(async (property) => {
//         let imageUrl = '';

//         if (property.coverPhoto?.url) {
//           try {
//             const exists = await s3.checkImageExistsInS3(property.id, s3Purpose);
//             if (!exists) {
//               await s3.uploadImageToS3(property.id, property.coverPhoto.url, s3Purpose);
//             }
//             imageUrl = await s3.getImageUrl(property.id, s3Purpose) || property.coverPhoto.url;
//           } catch (err) {
//             console.error('Error processing image:', property.id, err);
//             imageUrl = property.coverPhoto.url;
//           }
//         }

//         // Convert to DBProperty
//         return {
//           id: property.id,
//           title: property.title,
//           purpose: purpose,
//           price: property.price,
//           rooms: property.rooms,
//           baths: property.baths,
//           area: property.area,
//           rentFrequency: property.rentFrequency?.toUpperCase() as RentFrequency || null,
//           location: property.location?.[0]?.name || 'Unknown',
//           description: property.description,
//           furnishingStatus: property.furnishingStatus || null,
//           imageUrl: imageUrl,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         };
//       })
//     );
//   }

//   private async storePropertiesInDB(properties: DBProperty[]): Promise<DBProperty[]> {
//     return Promise.all(
//       properties.map(async (property) => {
//         const existing = await prisma.property.findUnique({
//           where: { id: property.id }
//         });

//         if (existing) return existing;

//         return prisma.property.create({
//           data: property
//         });
//       })
//     );
//   }

//   private static async fetchFromAPI(
//     purpose: PropertyPurpose,
//     page: number,
//     hitsPerPage: number
//   ): Promise<APIProperty[]> {
//     // Implement the logic to fetch properties from the API
//     // This is a placeholder implementation
//     return [];
//   }
// }

// // Create and export singleton instance
// export const propertyHandler = new PropertyHandler();

// // Export class for cases where a new instance is needed
// export default PropertyHandler;