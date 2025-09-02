import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let { messages } = req.body;

   messages = convertToModelMessages(messages);

    const result = await streamText({
      model: openai('gpt-4o'),
      messages,
    });

     if (result.textStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      for await (const chunk of result.textStream) {
        res.write(`data: ${chunk.text}\n\n`);
      }
      res.end();
    } else {
      const text = await result.text();
      res.json({ text });
    }
  } catch (err) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err.message });
  }
}
