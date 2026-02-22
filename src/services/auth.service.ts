import prisma from '@/lib/prisma';
import { redis, cartHelpers } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '@prisma/client';
import { AuthUser, GuestSession, RegisterRequest, ConvertGuestRequest } from '@/types';

const SALT_ROUNDS = 12;

export class AuthService {
    // Create a guest session
    async createGuestSession(): Promise<GuestSession> {
        const guestUuid = uuidv4();

        const user = await prisma.user.create({
            data: {
                guestUuid,
                role: 'GUEST',
            },
        });

        return {
            guestUuid,
            userId: user.id,
            createdAt: user.createdAt,
        };
    }

    // Get or create user from guest UUID
    async getOrCreateGuestUser(guestUuid: string): Promise<User> {
        let user = await prisma.user.findUnique({
            where: { guestUuid },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    guestUuid,
                    role: 'GUEST',
                },
            });
        }

        return user;
    }

    // Register a new user
    async register(data: RegisterRequest): Promise<User> {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: 'USER',
            },
        });

        return user;
    }

    // Login with email and password
    async login(email: string, password: string): Promise<User> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        return user;
    }

    // Convert guest to registered user (Lazy Registration)
    async convertGuestToUser(guestUuid: string, data: ConvertGuestRequest): Promise<User> {
        const guestUser = await prisma.user.findUnique({
            where: { guestUuid },
        });

        if (!guestUser) {
            throw new Error('Guest session not found');
        }

        if (guestUser.role !== 'GUEST') {
            throw new Error('User is already registered');
        }

        // Check if email is already taken
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prisma.user.update({
            where: { id: guestUser.id },
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name || guestUser.name,
                role: 'USER',
            },
        });

        return user;
    }



    // Merge guest cart with user cart
    async mergeGuestCart(guestUuid: string, userId: string): Promise<void> {
        const guestUser = await prisma.user.findUnique({
            where: { guestUuid },
        });

        if (!guestUser) return;

        // Get guest cart items from Redis
        const guestCart = await cartHelpers.getCart(guestUser.id);

        if (Object.keys(guestCart).length === 0) return;

        // Merge into user's cart
        for (const [variantId, quantity] of Object.entries(guestCart)) {
            await prisma.cartItem.upsert({
                where: {
                    userId_variantId: { userId, variantId },
                },
                update: {
                    quantity: { increment: quantity },
                },
                create: {
                    userId,
                    variantId,
                    quantity,
                },
            });
        }

        // Clear guest cart from Redis
        await cartHelpers.clearCart(guestUser.id);

        // Optionally delete the guest user if they have no orders
        const guestOrders = await prisma.order.count({
            where: { userId: guestUser.id },
        });

        if (guestOrders === 0) {
            await prisma.user.delete({
                where: { id: guestUser.id },
            });
        }
    }

    // Get user by ID
    async getUserById(userId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id: userId },
        });
    }

    // Get user profile with addresses
    async getUserProfile(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: {
                    orderBy: { isDefault: 'desc' },
                },
            },
        });
    }

    // Transform to AuthUser
    toAuthUser(user: User): AuthUser {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isGuest: user.role === 'GUEST',
        };
    }
}

export const authService = new AuthService();
export default authService;
