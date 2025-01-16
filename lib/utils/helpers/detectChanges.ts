// utils/detectChanges.ts
import { RealEstate } from "../types/real-estate";
import { isEqual, isEqualWith } from 'lodash';

/**
 * Detects changes between oldData and newData arrays of RealEstate objects and returns an
 * array of RealEstate objects with the correct "status" property
 * @param {RealEstate[]} oldData - The array of old RealEstate objects.
 * @param {RealEstate[]} newData - The array of new RealEstate objects.
 * @returns {RealEstate[]} An array of RealEstate objects with the correct "status" property.
 */
export const detectChanges = (oldData: RealEstate[], newData: RealEstate[]): RealEstate[] => {
    const oldDataMap = new Map(oldData.map(item => [item.linkToken, item]));

    return newData.map(newItem => {
        const isNew = !oldDataMap.has(newItem.linkToken);
        if (isNew) return { ...newItem, status: 'new' };

        const oldItem = oldDataMap.get(newItem.linkToken);
        const unchangeableProperties: (keyof RealEstate)[] = ['linkToken', 'status', 'estateType', 'settlement', 'neighborhood', 'street'];

        const isUpdated = !isEqualWith(oldItem, newItem, (oldValue, newValue, key) => {
            if (unchangeableProperties.includes(key as keyof RealEstate)) return true;
            if (key === undefined) return true;
            return isEqual(oldValue, newValue);
        });

        if (isUpdated) return { ...newItem, status: 'updated' };

        return { ...newItem, status: 'default' };
    });
};
