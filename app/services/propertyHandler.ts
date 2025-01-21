import { prisma } from '@/lib/prisma';
import { CreatePropertySchema } from '@/schema/properties';
import { z } from 'zod';
import { s3 } from './s3';
import { realEstate } from './realEstate';
import {RedisPaginationService } from './redis'
import {
  Property,
  ApiPurpose,
  DBProperty,
  DBPurpose,
  RentFrequency,
  PropertyKind,
  PurposeConverter
} from '@/lib/propertyType';

export interface PropertyResponse {
  hits: Property[];
  totalCount: number;  
}
export class PropertyHandler {
  private readonly ITEMS_PER_PAGE = 9; // 3*3 grid
  private redis: RedisPaginationService;
  constructor() {
    this.redis = new RedisPaginationService();
  }

  public async getProperties(
    purpose: ApiPurpose,
    page: number,
    hitsPerPage: number = this.ITEMS_PER_PAGE
): Promise<{ hits: DBProperty[]; nbHits: number;  total: number }> {
    try {
        console.log(`[PropertyHandler] Getting properties for purpose: ${purpose}, page: ${page}`);
        const dbPurpose = PurposeConverter.apiToDb(purpose);
        // Try to get from Redis cache first
        console.log('[PropertyHandler] Checking Redis cache...');
        const cachedData = await this.redis.getFromCache(dbPurpose, page);
        if (cachedData) {
            console.log('[PropertyHandler] Cache hit! Fetching properties from cache...');
            const properties = await this.getPropertiesFromIds(cachedData);
            const totalCount = await this.getTotalPropertiesCount(dbPurpose);
            
            return {
              hits: properties,
              nbHits: totalCount,
              total: totalCount
            };
          }
        console.log('[PropertyHandler] Cache miss. Proceeding with DB/API fetch...');
        const totalInDb = await this.getTotalPropertiesCount(dbPurpose);
        const requestedStartIndex = (page - 1) * hitsPerPage;

        // Check if we need to fetch more from API
        if (requestedStartIndex >= totalInDb) {
            console.log('Need more properties, fetching from API...');
            const apiResponse = await this.fetchFromAPI(purpose, page, hitsPerPage);
            
            const processedProperties = await this.processPropertiesImages(
                apiResponse.hits,
                dbPurpose
            );
            
            const storedProperties = await this.storePropertiesInDB(processedProperties);
            console.log('[PropertyHandler] Caching new properties in Redis...');
            await this.cachePropertyIds(dbPurpose, page, storedProperties);
            return {
                hits: storedProperties,
                nbHits: apiResponse.totalCount,
                total: apiResponse.totalCount
            };
        }

        console.log('[PropertyHandler] Fetching properties from DB...');
        const { properties, totalCount } = await this.getPropertiesFromDB(dbPurpose, page, hitsPerPage);
        console.log('[PropertyHandler] Caching DB properties in Redis...');
        await this.cachePropertyIds(dbPurpose, page, properties);
        return {
            hits: properties,
            nbHits: totalCount,
            total: totalCount // Using the count from DB
        };
    } catch (error) {
        console.error('Error in getProperties:', error);
        throw error;
    }
}
private async cachePropertyIds(purpose: DBPurpose, page: number, properties: DBProperty[]) {
    try {
      const formattedProperties = properties.map((prop, index) => ({
        serialNumber: ((page - 1) * this.ITEMS_PER_PAGE) + index + 1,
        id: prop.id
      }));

      console.log(`[PropertyHandler] Caching ${formattedProperties.length} properties for page ${page}`);
      await this.redis.setInCache(purpose, page, formattedProperties);
    } catch (error) {
      console.error('[PropertyHandler] Error caching property IDs:', error);
    }
  }
private async getPropertiesFromIds(cachedData: { serialNumber: number; id: string; }[]): Promise<DBProperty[]> {
    try {
        console.log(`[PropertyHandler] Fetching ${cachedData.length} properties from DB using cached IDs`);
        const propertyIds = cachedData.map(item => item.id);
        
        const properties = await prisma.property.findMany({
            where: {
                id: {
                    in: propertyIds
                }
            }
        });

        // First ensure properties are in the same order as cached IDs
        const orderedProperties = propertyIds.map(id => 
            properties.find(prop => prop.id === id)!
        ).filter(Boolean);

        // Then refresh S3 URLs
        console.log('[PropertyHandler] Refreshing S3 URLs for cached properties...');
        const propertiesWithValidUrls = await Promise.all(
            orderedProperties.map(async (property) => {
                if (!property.imageUrl) return property;

                try {
                    // Get fresh S3 URL (in case the old one expired)
                    const freshImageUrl = await s3.getImageUrl(property.id, property.purpose);
                    
                    return {
                        ...property,
                        imageUrl: freshImageUrl || property.imageUrl
                    };
                } catch (err) {
                    console.error('[PropertyHandler] Error refreshing S3 URL for cached property:', property.id, err);
                    return property;
                }
            })
        );

        return propertiesWithValidUrls;
    } catch (error) {
        console.error('[PropertyHandler] Error fetching properties from IDs:', error);
        throw error;
    }
}
private async getPropertiesFromDB(
  purpose: DBPurpose,
  page: number,
  hitsPerPage: number
): Promise<{ properties: DBProperty[]; totalCount: number }> {
  try {
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where: { purpose },
        skip: (page - 1) * hitsPerPage,
        take: hitsPerPage,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.property.count({
        where: { purpose }
      })
    ]);
    console.log(`[PropertyHandler] Found ${properties.length} properties in DB`);
    // For DB properties, ensure S3 URLs are still valid
    const propertiesWithValidUrls = await Promise.all(
      properties.map(async (property) => {
        if (!property.imageUrl) return property;

        try {
          // Get fresh S3 URL (in case the old one expired)
          const freshImageUrl = await s3.getImageUrl(property.id, purpose);
          
          return {
            ...property,
            imageUrl: freshImageUrl || property.imageUrl
          };
        } catch (err) {
          console.error('Error refreshing S3 URL for property:', property.id, err);
          return property;
        }
      })
    );
    
    return {
      properties: propertiesWithValidUrls,
      totalCount
    };
  } catch (error) {
    console.error('Error fetching properties from DB:', error);
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

  private async getTotalPropertiesCount(purpose: DBPurpose): Promise<number> {
    try {
      return await prisma.property.count({ where: { purpose } });
    } catch (error) {
      console.error('Error counting properties:', error);
      throw new Error(`Failed to count properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processPropertiesImages(
    properties: Property[],
    purpose: DBPurpose
  ): Promise<DBProperty[]> {
    return Promise.all(
      properties.map(async (property) => {
        let imageUrl = property.coverPhoto?.url || '';
  
        if (imageUrl) {
          try {
           const exists = await s3.checkImageExistsInS3(property.id, purpose);
           
            if (!exists) {
              console.log('Uploading new image to S3:', property.id);
              await s3.uploadImageToS3(property.id, imageUrl, purpose);
            }
            
            // Always get the S3 URL, whether we just uploaded or it existed
           imageUrl = await s3.getImageUrl(property.id, purpose) || '';
          } catch (err) {
            console.error('Error processing image for property:', property.id, err);
            imageUrl = ''; // Reset to empty string if processing failed
          }
        }
  
        return this.convertToDBProperty(property, purpose, imageUrl);
      })
    );
  }

  private convertToDBProperty(
    property: Property,
    purpose: DBPurpose,
    imageUrl: string
  ): DBProperty {
    return {
      id: property.id.toString(),
      title: property.title,
      purpose: purpose,
      price: property.price,
      rooms: property.rooms,
      baths: property.baths,
      area: property.area,
      rentFrequency: property.rentFrequency?.toUpperCase() as RentFrequency || null,
      location: property.location?.[0]?.name || 'Unknown',
      description: property.description || '',
      furnishingStatus: property.furnishingStatus || null,
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async storePropertiesInDB(properties: DBProperty[]): Promise<DBProperty[]> {
    const results: DBProperty[] = [];

    for (const property of properties) {
      try {
        if (!this.validateProperty(property)) {
          console.error('Property validation failed:', property);
          continue;
        }

        const savedProperty = await prisma.property.upsert({
          where: { id: property.id },
          update: { ...property, updatedAt: new Date() },
          create: { ...property, createdAt: new Date() }
        });

        results.push(savedProperty);
      } catch (error) {
        console.error('Error saving property:', error);
      }
    }

    return results;
  }
  private validateProperty(property: any): boolean {
    try {
      const validatedProperty = CreatePropertySchema.parse({
        ...property,
        purpose: property.purpose.toUpperCase(),
        createdAt: property.createdAt.toString(),
        updatedAt: property.updatedAt.toString()
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Property validation failed:', error.errors);
      }
      return false;
    }
  }
  private async fetchFromAPI(
    purpose: ApiPurpose,
    page: number,
    hitsPerPage: number
  ): Promise<PropertyResponse> {
    try {
      const propertyResponse = await realEstate.fetchProperties(purpose, page, hitsPerPage);
     
      return {
        hits: propertyResponse.hits || [],
        totalCount: propertyResponse.nbPages
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      throw error;
    }
  }
  public async invalidateCache(purpose: DBPurpose, page?: number): Promise<void> {
    try {
      console.log(`[PropertyHandler] Invalidating cache for purpose: ${purpose}, page: ${page || 'all'}`);
      await this.redis.invalidateCache(purpose, page || null);
    } catch (error) {
      console.error('[PropertyHandler] Error invalidating cache:', error);
    }
  }
  public async close(): Promise<void> {
    console.log('[PropertyHandler] Closing Redis connection...');
    await this.redis.close();
  }
  public async checkRedisHealth(): Promise<boolean> {
    return this.redis.checkConnection();
  }
}
export default PropertyHandler;
export const propertyHandler = new PropertyHandler();
