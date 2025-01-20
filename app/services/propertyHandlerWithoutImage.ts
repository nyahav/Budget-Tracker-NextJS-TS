import { prisma } from '@/lib/prisma';
import { CreatePropertySchema } from '@/schema/properties';
import { z } from 'zod';
import { s3 } from './s3';
import { realEstate } from './realEstate';
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

  public async getProperties(
    purpose: ApiPurpose,
    page: number,
    hitsPerPage: number = this.ITEMS_PER_PAGE
): Promise<{ hits: DBProperty[]; nbHits: number;  total: number }> {
    try {
        const dbPurpose = PurposeConverter.apiToDb(purpose);
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
            return {
                hits: storedProperties,
                nbHits: apiResponse.totalCount,
                total: apiResponse.totalCount
            };
        }

        // Get from DB if we have enough
        const { properties, totalCount } = await this.getPropertiesFromDB(dbPurpose, page, hitsPerPage);
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

private async getPropertiesFromDB(
  purpose: DBPurpose,
  page: number,
  hitsPerPage: number
): Promise<{ properties: DBProperty[]; totalCount: number }> {
  try {
    // Execute both queries in parallel for better performance
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
    
    return {
      properties,
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
        console.log('Processing image:', imageUrl);
        if (imageUrl) {
          try {
            const exists = await s3.checkImageExistsInS3(property.id, purpose);
            console.log('Image exists:', exists);
            if (!exists) {
              console.log('Uploading image to S3:', imageUrl);
              await s3.uploadImageToS3(property.id, imageUrl, purpose);
            }
            console.log('Getting image URL from S3:', imageUrl);
            imageUrl = (await s3.getImageUrl(property.id, purpose)) || imageUrl;
          } catch (err) {
            console.error('Error processing image:', property.id, err);
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
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString()
      });

      console.log('Property validation successful:', validatedProperty);
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
      console.log('API Response:', propertyResponse); // Add this to check the structure
      return {
        hits: propertyResponse.hits || [],
        totalCount: propertyResponse.nbPages
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      throw error;
    }
  }
}
export default PropertyHandler;
export const propertyHandler = new PropertyHandler();
