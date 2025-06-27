import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Props {
  params: {
    messageId: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  const { messageId } = params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idea = await prisma.idea.findUnique({ where: { messageId } });
    return NextResponse.json({ success: true, idea });
  } catch (err) {
    console.error('Error fetching idea:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { messageId: string } }) {
  const { messageId } = params;
  const { why, how, when } = await req.json();

  try {
    const idea = await prisma.idea.upsert({
      where: { messageId },
      update: { why, how, when },
      create: {
        messageId,
        why,
        how,
        when,
      },
    });

    return NextResponse.json({ success: true, idea });
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json({ success: false, error: 'Failed to update idea' }, { status: 500 });
  }
}
