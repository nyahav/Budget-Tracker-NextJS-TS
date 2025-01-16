import { yad2RealEstateRequestURL } from '../../scraper/main/utils/helpers/yad2RealEstateRequestURL';
import { extractOnlyRealEstateData } from './extractOnlyRealEstateData';
import { sortRealEstateItemsByDate } from '../../scraper/main/utils/helpers/sortRealEstateItemsByDate';
import { detectChanges } from './detectChanges';
import { removeDuplicates } from './removeDuplicates';
import { getTodayDateTime } from './getTodayDateTime';

export {
    yad2RealEstateRequestURL,
    extractOnlyRealEstateData,
    sortRealEstateItemsByDate,
    detectChanges,
    removeDuplicates,
    getTodayDateTime,
};