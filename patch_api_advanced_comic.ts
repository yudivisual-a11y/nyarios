import fs from 'fs';

let content = fs.readFileSync('api/generate.ts', 'utf8');

const oldPromptBlock = `If type is 'comic', return this format:
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
        }`;

const newPromptBlock = `If type is 'comic', return this format:
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
        Generate at least 3 pages. For comics, generate 3-5 panels per page. Vary the 'span' between 'normal' and 'wide' to create dynamic layouts. Combine character appearances into image prompts so they remain visually consistent.`;

content = content.replace(oldPromptBlock, newPromptBlock);
fs.writeFileSync('api/generate.ts', content);
