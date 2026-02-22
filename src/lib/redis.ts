import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

function getRedisClient(): Redis {
    if (!globalForRedis.redis) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        globalForRedis.redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            retryStrategy: (times: number) => {
                if (times > 3) return null;
                return Math.min(times * 100, 3000);
            },
        });

        globalForRedis.redis.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        globalForRedis.redis.on('connect', () => {
            console.log('Redis connected successfully');
        });
    }

    return globalForRedis.redis;
}

export const redis = getRedisClient();

// Helper functions for cart operations
export const cartHelpers = {
    getCartKey: (userId: string) => `cart:${userId}`,

    async getCart(userId: string): Promise<Record<string, number>> {
        const cart = await redis.hgetall(this.getCartKey(userId));
        const result: Record<string, number> = {};
        for (const [variantId, quantity] of Object.entries(cart)) {
            result[variantId] = parseInt(quantity, 10);
        }
        return result;
    },

    async addToCart(userId: string, variantId: string, quantity: number): Promise<void> {
        await redis.hincrby(this.getCartKey(userId), variantId, quantity);
    },

    async setCartItem(userId: string, variantId: string, quantity: number): Promise<void> {
        if (quantity <= 0) {
            await redis.hdel(this.getCartKey(userId), variantId);
        } else {
            await redis.hset(this.getCartKey(userId), variantId, quantity.toString());
        }
    },

    async removeFromCart(userId: string, variantId: string): Promise<void> {
        await redis.hdel(this.getCartKey(userId), variantId);
    },

    async clearCart(userId: string): Promise<void> {
        await redis.del(this.getCartKey(userId));
    },

    async setCartExpiry(userId: string, seconds: number = 60 * 60 * 24 * 30): Promise<void> {
        // Default: 30 days expiry for guest carts
        await redis.expire(this.getCartKey(userId), seconds);
    },
};

// Session helpers
export const sessionHelpers = {
    getSessionKey: (token: string) => `session:${token}`,

    async setSession(token: string, data: Record<string, unknown>, expiresInSeconds: number = 60 * 60 * 24 * 7): Promise<void> {
        await redis.setex(this.getSessionKey(token), expiresInSeconds, JSON.stringify(data));
    },

    async getSession(token: string): Promise<Record<string, unknown> | null> {
        const data = await redis.get(this.getSessionKey(token));
        return data ? JSON.parse(data) : null;
    },

    async deleteSession(token: string): Promise<void> {
        await redis.del(this.getSessionKey(token));
    },
};

export default redis;
