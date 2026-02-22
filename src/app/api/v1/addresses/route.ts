import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET all addresses for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const addresses = await prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ],
        });

        return NextResponse.json({ success: true, data: addresses });
    } catch (error) {
        console.error('[Addresses] GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

// POST new address
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            label,
            fullName,
            phone,
            street,
            building,
            floor,
            apartment,
            city,
            governorate,
            postalCode,
            lat,
            lng,
            isDefault,
        } = body;

        // Validate required fields
        if (!fullName || !phone || !street || !city || !governorate) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.create({
            data: {
                userId: session.user.id,
                label: label || 'Home',
                fullName,
                phone,
                street,
                building,
                floor,
                apartment,
                city,
                governorate,
                postalCode,
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
                isDefault: isDefault ?? true,
            },
        });

        return NextResponse.json({ success: true, data: address });
    } catch (error) {
        console.error('[Addresses] POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create address' },
            { status: 500 }
        );
    }
}
