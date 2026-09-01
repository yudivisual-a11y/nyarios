import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ 
      error: 'API Key Gemini belum dikonfigurasi di Vercel Environment Variables. Silakan tambahkan GEMINI_API_KEY di dashboard Vercel Anda.' 
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a creative studio assistant. Generate a structured JSON response for a ${type} based on this prompt: "${prompt}". 
        If type is 'comic', return this format:
        {
          "title": "Comic Title",
          "outline": ["Chap 1", "Chap 2"],
          "characters": [
            {
               "name": "Char 1", 
               "description": "Short bio", 
               "appearance": "Detailed visual description: hair color, eye color, specific clothing, body type. This is the Character Bible."
            }
          ],
          "pages": [
            {
              "pageNumber": 1,
              "layout": "action",
              "panels": [
                { 
                  "id": "p1",
                  "span": "wide",
                  "imagePrompt": "Detailed visual scene. Mention characters by their appearance, not just name.", 
                  "dialogue": "Hello!",
                  "narration": "Meanwhile..."
                },
                { 
                  "id": "p2",
                  "span": "normal",
                  "imagePrompt": "Close up of face.", 
                  "dialogue": "Hi there!"
                }
              ]
            }
          ]
        }
        Generate at least 3 pages. For comics, generate 3-5 panels per page. Vary the 'span' between 'normal' and 'wide' to create dynamic layouts. Combine character appearances into image prompts so they remain visually consistent.
        If type is NOT 'comic', return this format:
        {
          "title": "Book Title",
          "outline": ["Chap 1", "Chap 2"],
          "characters": [{"name": "Char 1", "description": "desc"}],
          "pages": [
            {
              "pageNumber": 1,
              "text": "Story text for page 1",
              "imagePrompt": "Image generation prompt for page 1"
            }
          ]
        }
        Generate at least 3 pages. For comics, generate 2-4 panels per page. Do not include markdown code blocks, just raw JSON.` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
       throw new Error(data.error.message);
    }

    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghasilkan konten.' });
  }
}
