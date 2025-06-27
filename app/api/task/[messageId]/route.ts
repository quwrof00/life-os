import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }   
) {
  const { messageId } = await params;                    

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { messageId } });
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('[TASK_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }   
) {
  const { messageId } = await params;
  const { deadline, priority, labels } = await req.json();

  try {
    const deadlineDate = deadline ? new Date(deadline) : null;

    const task = await prisma.task.upsert({
      where:  { messageId },
      update: { deadline: deadlineDate, priority, labels },
      create: { messageId,  deadline: deadlineDate, priority, labels },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('[TASK_PUT_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}