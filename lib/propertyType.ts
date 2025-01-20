// Base Types & Enums - Matching Prisma schema
export type DBPurpose = 'buy' | 'rent';
export type ApiPurpose = 'for-sale' | 'for-rent';
export type PropertyKind = DBPurpose;
export type RentFrequency = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | null;

export const PurposeConverter = {
  apiToDb: (purpose: ApiPurpose): DBPurpose => {
    return purpose === 'for-sale' ? 'buy' : 'rent';
  },
  dbToApi: (purpose: DBPurpose): ApiPurpose => {
    return purpose === 'buy' ? 'for-sale' : 'for-rent';
  }
};

// External API Interface
export interface Property {
  id: string;
  title: string;
  purpose: 'for-sale' | 'for-rent';
  price: number;
  rooms: number;
  baths: number;
  area: number;
  isVerified: boolean;
  rentFrequency?: 'yearly' | 'monthly' | 'weekly' | 'daily';
  location: {
    name: string;
    externalID: string;
  }[];
  coverPhoto: {
    url: string;
    id: number;
  };
  photos: {
    url: string;
    id: number;
  }[];
  description: string;
  type: string;
  furnishingStatus?: string;
  amenities: {
    amenities: {
      text: string;
      value: string;
    }[];
  }[];
  phoneNumber: {
    mobile: string;
    phone: string;
    proxyMobile?: string;
    proxyPhone?: string;
  };
  contactName: string;
  agency: {
    name: string;
    logo: {
      url: string;
    };
  };
  category: {
    name: string;
    externalID: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Database Interface - Matching Prisma schema
export interface DBProperty {
  id: string;
  title: string;
  purpose: DBPurpose;
  price: number;
  rooms: number;
  baths: number;
  area: number;
  rentFrequency: RentFrequency;
  location: string;
  description: string;
  furnishingStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string | null;
}

// Type Conversion Functions
export const apiToDbProperty = (prop: Property): DBProperty => ({
  id: prop.id,
  title: prop.title,
  purpose: PurposeConverter.apiToDb(prop.purpose),
  price: prop.price,
  rooms: prop.rooms,
  baths: prop.baths,
  area: prop.area,
  rentFrequency: (prop.rentFrequency?.toUpperCase() as RentFrequency) || null,
  location: prop.location[0]?.name || 'Unknown',
  description: prop.description,
  furnishingStatus: prop.furnishingStatus || null,
  createdAt: new Date(),
  updatedAt: new Date(),
  imageUrl: prop.coverPhoto?.url || null, 
});

export const dbToApiProperty = (dbProp: DBProperty): Partial<Property> => ({
  id: dbProp.id,
  title: dbProp.title,
  purpose: PurposeConverter.dbToApi(dbProp.purpose),
  price: dbProp.price,
  rooms: dbProp.rooms,
  baths: dbProp.baths,
  area: dbProp.area,
  location: [{ name: dbProp.location, externalID: dbProp.id }],
  description: dbProp.description,
  furnishingStatus: dbProp.furnishingStatus || undefined,
  rentFrequency: dbProp.rentFrequency?.toLowerCase() as Property['rentFrequency'],
  createdAt: dbProp.createdAt.toString(),
  updatedAt: dbProp.updatedAt.toString(),
  coverPhoto: dbProp.imageUrl ? { url: dbProp.imageUrl, id: 0 } : undefined,
});