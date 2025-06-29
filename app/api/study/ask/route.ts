import { NextResponse } from 'next/server';
import { pineconeIndex as index } from '@/lib/pinecone';
import { embedText } from '@/lib/cohere';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId, messageId, question } = await req.json();

    if (!userId || !messageId || !question) {
      return NextResponse.json({ success: false, error: 'Missing fields for ask' });
    }

    // Embed the user's question
    const [queryEmbedding] = await embedText([question]);
    console.log("embedded");
    

    // Search Pinecone in scoped namespace
    const result = await index.namespace(`${userId}_${messageId}`).query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
});

    const context = result.matches
      ?.map((match) => match.metadata?.content)
      .join('\n\n') || 'No context found.';
      console.log("found context ", context);
      

    // Send to Claude via OpenRouter
    const claudeRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI tutor helping a student with their study note.',
          },
          {
            role: 'user',
            content: `The student wrote the following:\n\n"${context}"\n\nNow they ask:\n"${question}"\n\nGive a clear, accurate, and helpful answer. Keep it short and concise, unless the user asks for otherwise.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    const claudeData = await claudeRes.json();
    console.log(claudeData);
    
    const answer = claudeData.choices?.[0]?.message?.content;
    console.log(answer);
    

    return NextResponse.json({ success: true, answer });
  } catch (err) {
    console.error('Deepseek Ask API error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong' });
  }
}
