// lib/redis.ts
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();

type PropertyType = 'rent' | 'buy';

// Cache key generators
export const getCacheKeys = {
    // For single property
    property: (id: string, purpose: 'rent' | 'buy') => 
      `property:${purpose}:${id}`,
    
    // For page results
    propertyPage: (page: number, hitsPerPage: number, purpose: 'rent' | 'buy') => 
      `properties:${purpose}:page:${page}:${hitsPerPage}`,
      
    // For property images
    propertyImage: (propertyId: string, purpose: 'rent' | 'buy') => 
      `property:${purpose}:${propertyId}:image`
  };


  export async function getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      console.error('Redis cache error:', error);
      return null;
    }
  }

  export async function setInCache<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  export async function invalidateCache(key: string): Promise<void> {
    await redis.del(key);
  }