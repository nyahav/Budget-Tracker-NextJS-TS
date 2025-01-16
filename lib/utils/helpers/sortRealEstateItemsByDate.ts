import { RealEstate } from '../types/real-estate';

export const sortRealEstateItemsByDate = (realEstateItems: RealEstate[]): RealEstate[] => {
    return realEstateItems.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}