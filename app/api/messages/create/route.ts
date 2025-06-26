import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { inngest } from '@/inngest/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { content, userId } = await req.json();

    if (!content || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing content or userId' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        userId,
      },
    });

    // Send event to Inngest to enrich it
    await inngest.send({
      name: 'message/created',
      data: {
        messageId: message.id,
        content,
        userId,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('[CREATE_MESSAGE_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
