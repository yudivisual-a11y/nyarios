export interface GenerationResult {
  title: string;
  outline: string[];
  characters: any[];
  pages: { pageNumber: number; text: string; imagePrompt: string }[];
}

export class GenerationService {
  static async generateProject(prompt: string, type: string): Promise<GenerationResult> {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Server error: ${res.status}`);
      }

      return await res.json();
    } catch (error: any) {
      console.error("GenerationService Error:", error);
      throw error;
    }
  }
}
