import { Redis } from 'ioredis';
import {DBPurpose} from '@/lib/propertyType';
 //page in redis cache 
// [
//   { "serialNumber": 1, "id": "property_123" },
//   { "serialNumber": 2, "id": "property_456" },
//   { "serialNumber": 3, "id": "property_789" },
//   // ... עד 9 פריטים בכל עמוד
// ]

export interface CachedProperty {
  serialNumber: number;
  id: string;
}
interface Property {
  id: string;
}

interface PaginatedProperty {
  serialNumber: number;
  id: string;
}

export type FetchFromDBFunction = (
  purpose: DBPurpose,
  startIndex: number,
  limit: number
) => Promise<Property[]>;

export class RedisPaginationService {

  private redis: Redis;
  private readonly ITEMS_PER_PAGE: number;
  private readonly CACHE_TTL: number;
  private isConnected: boolean = false;
  static getFromCache: any;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://redis:6379') {
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 5,
      enableReadyCheck: true
    });
    this.ITEMS_PER_PAGE = 9;
    this.CACHE_TTL = 3600;
    this.setupConnectionMonitoring();
  }
  private setupConnectionMonitoring() {
    this.redis.on('connect', () => {
      console.log('Redis: Connected');
      this.isConnected = true;
    });
    
    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.isConnected = false;
    });
  }
  async checkConnection(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      console.log('Redis health check:', pong === 'PONG' ? 'OK' : 'Failed');
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
  /**
   * Generates cache key based on purpose and page number
   */
  private generateCacheKey(purpose: DBPurpose, page: number): string {
    return `properties:${purpose}:page:${page}`;
  }

  /**
   * Get paginated items from cache
   */
  async getFromCache(purpose: DBPurpose, page: number): Promise<PaginatedProperty[] | null> {
    if (!this.isConnected) {
      console.log('Redis: Not connected, attempting health check...');
      const healthy = await this.checkConnection();
      if (!healthy) {
        console.error('Redis: Connection unhealthy');
        return null;
      }
    }
    
    try {
      const cacheKey = this.generateCacheKey(purpose, page);
      const cachedData = await this.redis.get(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      return JSON.parse(cachedData) as PaginatedProperty[];
    } catch (error) {
      console.error('Error getting data from cache:', error);
      return null;
    }
  }

  /**
   * Set paginated items in cache
   */
  async setInCache(
    purpose: DBPurpose,
    page: number,
    items: PaginatedProperty[]
  ): Promise<boolean> {
    if (!this.isConnected) {
      console.log('Redis: Not connected, attempting health check...');
      const healthy = await this.checkConnection();
      if (!healthy) {
        console.error('Redis: Connection unhealthy');
        return false;
      }
    }
    try {
      const cacheKey = this.generateCacheKey(purpose, page);
      await this.redis.setex(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(items)
      );
      return true;
    } catch (error) {
      console.error('Error setting data in cache:', error);
      return false;
    }
  }

  /**
   * Invalidate cache for specific purpose and page
   */
  async invalidateCache(purpose: DBPurpose, page: number | null = null): Promise<boolean> {
    if (!this.isConnected) {
      console.log('Redis: Not connected, attempting health check...');
      const healthy = await this.checkConnection();
      if (!healthy) {
        console.error('Redis: Connection unhealthy');
        return false;
      }
    }
    try {
      if (page !== null) {
        // Invalidate specific page
        const cacheKey = this.generateCacheKey(purpose, page);
        await this.redis.del(cacheKey);
      } else {
        // Invalidate all pages for this purpose
        const pattern = `properties:${purpose}:page:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      }
      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  }

  /**
   * Get paginated property IDs
   */
  async getPaginatedProperties(
    purpose: DBPurpose,
    page: number,
    fetchFromDB: FetchFromDBFunction
  ): Promise<PaginatedProperty[]> {
    try {
      // Try to get from cache first
      const cachedData = await this.getFromCache(purpose, page);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from DB
      const startIndex = (page - 1) * this.ITEMS_PER_PAGE;
      const items = await fetchFromDB(purpose, startIndex, this.ITEMS_PER_PAGE);
      
      // Format the response
      const formattedItems = items.map((item, index) => ({
        serialNumber: startIndex + index + 1,
        id: item.id
      }));

      // Cache the results
      await this.setInCache(purpose, page, formattedItems);

      return formattedItems;
    } catch (error) {
      console.error('Error getting paginated properties:', error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Create and export singleton instance
export const redis = new RedisPaginationService();

// Export class for cases where a new instance is needed
export default RedisPaginationService;