import { RealEstate } from "./types/real-estate";

// Dummy implementations (replace with actual logic)
export const extractOnlyRealEstateData = (data: any): RealEstate[] => {
    return data.data.feed.feed_items || [];
};

export const removeDuplicates = (items: RealEstate[]): RealEstate[] => {
    const seen = new Set();
    return items.filter(item => {
        if (seen.has(item.linkToken)) return false;
        seen.add(item.linkToken);
        return true;
    });
};

export const detectChanges = (oldData: RealEstate[], newData: RealEstate[]): RealEstate[] => {
    return newData.map(item => ({
        ...item,
        status: oldData.some(old => old.linkToken === item.linkToken) ? 'updated' : 'new'
    }));
};
