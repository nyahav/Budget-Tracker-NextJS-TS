export interface RealEstate {
    status: 'new' | 'updated' | 'default' | 'removed';
    linkToken: string;
    estateType: string;
    street: string;
    neighborhood: string;
    settlement: string;
    rooms: number;
    floor: number | 'קרקע';
    squareMeters: number;
    updatedAt: string;
    price: string;
  }
  