import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message });
}

export async function PUT(
  req: NextRequest,
  paramsPromise: Promise<{ params: Promise<{ id: string }> }>
) {
  const { params } = await paramsPromise;
  const { id } = await params;

  const { content } = await req.json();

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json(
      { success: false, error: 'Valid content required' },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error('[UPDATE_PUT_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Update failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  paramsPromise: Promise<{ params: Promise<{ id: string }> }>
) {
  const { params } = await paramsPromise;
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { completed } = await req.json();

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid completed value' },
        { status: 400 }
      );
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { completed },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error('[UPDATE_PATCH_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}