//lib/propertyType.ts

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