const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export async function callGemini({
  prompt,
  temperature = 0.7,
  maxTokens = 8000,
  responseFormat = 'json'
}: GeminiRequest) {
  if (!GEMINI_API_KEY) {
    throw new GeminiError('Missing GOOGLE_AI_API_KEY environment variable');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: responseFormat === 'json' ? 'application/json' : 'text/plain'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new GeminiError(
      `Gemini API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new GeminiError('Invalid response format from Gemini API');
  }

  const text = data.candidates[0].content.parts[0].text;

  if (responseFormat === 'json') {
    try {
      return JSON.parse(text);
    } catch (error) {
      // Try to fix common JSON issues
      console.error('JSON parse error, attempting to fix...', error);

      // Try to extract JSON from code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      // Try parsing again
      try {
        return JSON.parse(cleanedText);
      } catch (secondError) {
        console.error('Failed to fix JSON:', cleanedText.substring(0, 500));
        throw new GeminiError('Failed to parse JSON response from Gemini API');
      }
    }
  }

  return text;
}

// Retry with exponential backoff for rate limiting and JSON parse errors
export async function callGeminiWithRetry(
  request: GeminiRequest,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callGemini(request);
    } catch (error: any) {
      const isLastRetry = i === maxRetries - 1;

      // Rate limit: 15 RPM
      if (error.status === 429 && !isLastRetry) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // JSON parse error - retry with slightly higher temperature
      if (error.message?.includes('parse JSON') && !isLastRetry) {
        console.log(`JSON parse error. Retrying ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      throw error;
    }
  }
  throw new GeminiError('Max retries exceeded');
}

// Generate web structure
export async function generateStructure(projectData: any, existingPatterns: string[] = []) {
  const prompt = `คุณเป็น Web Structure Specialist สำหรับเว็บไซต์ TM ในประเทศไทย

## Input ที่ได้รับ:
- Brand: ${projectData.brand_name}
- Domain: ${projectData.domain}
- Focus Type: ${projectData.focus_type}
- สัดส่วน: ${JSON.stringify(projectData.focus_percentages)}
- จำนวนหน้า: ${projectData.total_pages}
- URL Style: ${projectData.url_style}
- ภาษา: ${projectData.output_language}

## หน้าบังคับ (ต้องมีเสมอ):
1. / (Homepage) - Pillar หลัก
2. /register - Conversion
3. /promotion - Support
4. /contact - Support

## URL Patterns ที่ใช้ไปแล้ว (ห้ามซ้ำ):
${existingPatterns.length > 0 ? existingPatterns.join(', ') : 'ไม่มี'}

## กฎการสร้าง:
1. แบ่งหน้าตามสัดส่วนที่กำหนด (ปัดเศษได้)
2. ทุก category ต้องมี Parent page (Pillar)
3. URL ต้องไม่ซ้ำกับ patterns ที่ใช้ไปแล้ว
4. ใช้ URL style ตามที่เลือก (nested/flat)
5. Homepage เป็น Pillar หลัก link ไปทุก section
6. หน้า Conversion (register) ต้องมี priority สูง
7. title_pattern ต้องเป็นรูปแบบ: "ชื่อไทย {brand}" เท่านั้น (ไม่ต้องมีภาษาอังกฤษ)

## Output Format (JSON):
{
  "pages": [
    {
      "url_path": "/",
      "page_type": "pillar",
      "title_pattern": "หน้าหลัก {brand}",
      "category": "general",
      "is_required": true
    },
    {
      "url_path": "/lottery",
      "page_type": "pillar",
      "title_pattern": "หวยออนไลน์ {brand}",
      "category": "lottery",
      "is_required": false
    },
    {
      "url_path": "/lottery/hanoi",
      "page_type": "content",
      "title_pattern": "หวยฮานอย {brand}",
      "category": "lottery",
      "is_required": false
    }
  ],
  "internal_links": {
    "/": ["pillar ทุกหมวด"],
    "/lottery": ["/", "/lottery/*"]
  }
}

สร้าง structure ที่สมบูรณ์และไม่ซ้ำเลย`;

  return await callGeminiWithRetry({
    prompt,
    temperature: 0.7,
    maxTokens: 8000,
    responseFormat: 'json'
  });
}

// Generate content brief for a single page
export async function generateBrief(pageData: any, projectData: any) {
  const prompt = `คุณเป็น SEO Content Strategist สำหรับเว็บไซต์ TM ในประเทศไทย

## Input:
- Brand: ${projectData.brand_name}
- Page: ${pageData.url_path}
- Page Type: ${pageData.page_type}
- Category: ${pageData.category || 'general'}
- Tone: ${projectData.tone || 'professional'}
- Word Count: ${projectData.word_count_range || '1500-2000'}
- ภาษา: ${projectData.output_language}

## Internal Link Requirements:
- Homepage (/) = Pillar ใหญ่สุด → link ไป Pillar รองทุกหมวด
- Pillar รอง (/lottery) → link ไป Homepage 1 จุด + Clusters ทั้งหมด
- Cluster (/lottery/hanoi) → link ไป Pillar ที่เกี่ยวข้อง 1 จุด + Cluster อื่น 1 จุด
- CTA 2 จุดในทุกหน้า

## Output Format (JSON):
{
  "meta_title": "หวยฮานอย {brand} - เว็บแทงหวยฮานอยออนไลน์ จ่ายจริง",
  "meta_description": "แทงหวยฮานอย {brand} เว็บตรง อัตราจ่ายสูง...",
  "h1": "หวยฮานอย {brand}",
  "content_structure": [
    {
      "h2": "หวยฮานอยคืออะไร",
      "h3s": ["เวลาออกผลหวยฮานอย", "วิธีดูผลหวยฮานอย"],
      "description": "อธิบายพื้นฐานเกี่ยวกับหวยฮานอย"
    }
  ],
  "word_count": {"min": 1500, "max": 2000},
  "keywords": ["หวยฮานอย", "แทงหวยฮานอย"],
  "internal_links": [
    {"target": "/", "anchor_suggestion": "{brand}", "type": "pillar"}
  ],
  "cta_placements": [
    {"position": "after_intro", "text": "สมัครเลย", "link": "/register"}
  ]
}

สร้าง content brief ที่สมบูรณ์และเหมาะกับ SEO`;

  return await callGeminiWithRetry({
    prompt,
    temperature: 0.7,
    maxTokens: 4000,
    responseFormat: 'json'
  });
}
