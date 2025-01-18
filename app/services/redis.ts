// lib/redis.ts
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();

type PropertyType = 'rent' | 'buy';

export async function getPropertyFromCache(id: string, type: PropertyType): Promise<any | null> {
  try {
    const cached = await redis.get(`property:${type}:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Redis cache error:', error);
    return null;
  }
}

export async function setPropertyCache(property: any, type: PropertyType, ttl: number = 3600): Promise<void> {
  try {
    await redis.setex(`property:${type}:${property.id}`, ttl, JSON.stringify(property));
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
}

export async function getProperty(id: string, type: PropertyType): Promise<any> {
  // Try to get from cache first
  const cached = await getPropertyFromCache(id, type);
  if (cached) {
    console.log(`Cache hit for ${type} property:`, id);
    return cached;
  }

  // If not in cache, fetch from appropriate table based on type
  let property;
  if (type === 'buy') {
    property = await prisma.propertyToBuy.findUnique({ where: { id } });
  } else {
    property = await prisma.propertyToRent.findUnique({ where: { id } });
  }

  if (!property) {
    throw new Error(`${type} property not found`);
  }

  // Store in cache for future requests
  await setPropertyCache(property, type);
  console.log(`Cache miss for ${type} property:`, id);
  
  return property;
}

// Cache invalidation with type support
export async function invalidatePropertyCache(id: string, type: PropertyType): Promise<void> {
  await redis.del(`property:${type}:${id}`);
}