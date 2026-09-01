import fs from 'fs';

let content = fs.readFileSync('api/generate.ts', 'utf8');

const oldPrompt = `You are a creative studio assistant. Generate a structured JSON response for a \${type} based on this prompt: "\${prompt}". 
        Return ONLY valid JSON in this format:
        {
          "title": "Book Title",
          "outline": ["Chap 1", "Chap 2"],
          "characters": [{"name": "Char 1", "description": "desc"}],
          "pages": [
            {
              "pageNumber": 1,
              "text": "Story text for page 1",
              "imagePrompt": "Image generation prompt for page 1"
            },
            {
              "pageNumber": 2,
              "text": "Story text for page 2",
              "imagePrompt": "Image generation prompt for page 2"
            }
          ]
        }
        Generate at least 3 pages. Do not include markdown code blocks, just raw JSON.`;

const newPrompt = `You are a creative studio assistant. Generate a structured JSON response for a \${type} based on this prompt: "\${prompt}". 
        If type is 'comic', return this format:
        {
          "title": "Comic Title",
          "outline": ["Chap 1", "Chap 2"],
          "characters": [{"name": "Char 1", "description": "desc"}],
          "pages": [
            {
              "pageNumber": 1,
              "panels": [
                { "imagePrompt": "Panel 1 visual description", "dialogue": "Character: Hello!" },
                { "imagePrompt": "Panel 2 visual description", "dialogue": "Character: Hi there!" }
              ]
            }
          ]
        }
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
        Generate at least 3 pages. For comics, generate 2-4 panels per page. Do not include markdown code blocks, just raw JSON.`;

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync('api/generate.ts', content);
