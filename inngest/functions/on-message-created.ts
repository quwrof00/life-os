import { inngest } from '@/inngest/client';
import prisma from '@/lib/prisma';
import { embedText } from '@/lib/cohere';
import { pineconeIndex as index } from '@/lib/pinecone';
import { Category, Mood } from '@prisma/client';

type Classification = {
  category?: string;
  mood?: string;
  summary?: string;
};

export const enrichMessage = inngest.createFunction(
  { id: 'enrich-message' },
  { event: 'message/created' },
  async ({ event }) => {
    const { messageId, content, userId } = event.data;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [
          {
            role: 'system',
            content: `You're an assistant that classifies messages.
            Return a JSON object with keys:
            - category: one of STUDY (any study notes), IDEA, RANT, TASK (to-do stuff), LOG (like a journal), MEDIA (anything media-related even rants), QUOTE, OTHER
            - mood: NEUTRAL, HAPPY, SAD, ANGRY, TIRED, ANXIOUS, EXCITED, BORED, REFLECTIVE
            - summary: one-sentence summary of the message.
            If unsure, default to:
            category: OTHER
            mood: NEUTRAL
            summary: ""`,
          },
          { role: 'user', content },
        ],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    const json = await aiRes.json();
    console.log(json);
    

    if (!aiRes.ok || !json.choices?.[0]?.message?.content) {
      throw new Error('AI classification failed');
    }

    let parsed: Classification = {};
    try {
      const raw = json.choices[0].message.content || '{}';
      console.log(raw);
      
      const cleaned = raw.trim().replace(/^```json|```$/g, '').trim();
      parsed = JSON.parse(cleaned);
      console.log(parsed);
      
    } catch {
      throw new Error('Invalid AI response format');
    }

    const category = parsed.category?.toUpperCase() || 'OTHER';
    const mood = parsed.mood?.toUpperCase() || 'NEUTRAL';
    const summary = parsed.summary || '';

    await prisma.message.update({
      where: { id: messageId },
      data: {
        type: category as Category,
        mood: mood as Mood,
        summary,
      },
    });

    if (category === 'STUDY') {
      const embedding = await embedText([content]);

      await index.namespace(`${userId}_${messageId}`).upsert([
        {
          id: messageId,
          values: embedding[0],
          metadata: {
            content,
            userId,
          },
        },
      ]);
    } 
    else if (category === 'MEDIA') {
      const hotRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',       
      temperature: 0,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `Classify how bold this media opinion is.
          Return JSON with keys:
          - boldness: "Cold Take", "Mild Take", "Hot Take", or "Nuclear Take"
          - explanation: one short sentence
          - confidence: integer 0–100 (how sure you are)`,
        },
        { role: 'user', content },                
      ],
    }),
  });

  const hotJson = await hotRes.json();
  if (!hotRes.ok || !hotJson.choices?.[0]?.message?.content) {
    throw new Error('Hot-take classification failed');
  }

  const hotRaw = hotJson.choices[0].message.content.trim()
                       .replace(/^```json|```$/g, '')
                       .trim();
  const { boldness, explanation, confidence } = JSON.parse(hotRaw);
  await prisma.media.upsert({
  where: { messageId },
  create: {
    messageId,
    boldness: boldness || null,
    boldnessExplanation: explanation || null,
    boldnessConfidence: confidence || null,
  },
  update: {
    boldness: boldness || null,
    boldnessExplanation: explanation || null,
    boldnessConfidence: confidence || null,
  },
});
    }

    return { enriched: true };
  }
);
