const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = 'pcamir2002@gmail.com'; // Using the email provided by user

async function makeAdmin() {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });w

        console.log(`✅ Success! User ${updatedUser.email} is now an ADMIN.`);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
