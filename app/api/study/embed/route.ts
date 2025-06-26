import { NextResponse } from 'next/server';
import { embedText } from '@/lib/cohere';
import { pineconeIndex as index } from '@/lib/pinecone';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { userId, messageId, content } = body;

    if (!userId || !messageId || !content) {
      return NextResponse.json({ success: false, error: 'Missing fields' });
    }

    const [embedding] = await embedText([content]);

    await index.upsert([
      {
        id: `${userId}_${messageId}`,
        values: embedding,
        metadata: { userId, messageId, content },
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Embed error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' });
  }
}
