import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Example DB client
import { validateDate } from '@/lib/validateDate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    const { searchParams } = new URL(request.url);
const date = searchParams.get('date');

if (!date || !validateDate(date)) {
  return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
}

const start = new Date(`${date}T00:00:00`);
const end = new Date(`${date}T23:59:59.999`);

const messages = await prisma.message.findMany({
  where: {
    userId: session.user.id,
    createdAt: {
      gte: start,
      lt: end,
    },
  },
  orderBy: { createdAt: 'asc' },
});


    // Format response
    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}