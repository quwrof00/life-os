import prisma from "./prisma";

export const generateTotalSummary = async (userId: string) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const allMessages = await prisma.message.findMany({
    where: {
      userId,
      createdAt: { gte: oneWeekAgo },
    },
    orderBy: { createdAt: "asc" },
  });

  if (allMessages.length === 0) {
    return "No data to summarize for this week.";
  }

  const formatted = allMessages
    .map(
      (msg) =>
        `- [${(msg.type ?? "OTHER").toUpperCase()}] ${msg.content}`
    )
    .join("\n");

  const prompt = `
You are an AI assistant that summarizes a user's week.

Here are their messages for the past seven days:
${formatted}

Generate a short, reflective paragraph describing what the user has been doing, how they've been feeling, and any patterns you notice.
`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-30b-a3b-04-28:free", 
        messages: [{ role: "user", content: prompt }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const summary = data.choices?.[0]?.message?.content?.trim();

  return summary || "Summary generation failed. Please try again.";
};
