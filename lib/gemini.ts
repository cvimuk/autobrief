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
  const prompt = `คุณเป็น SEO & Information Architecture Specialist สำหรับเว็บไซต์ TM ในประเทศไทย ที่เชี่ยวชาญเรื่อง User Journey และ Priority System

## Input ที่ได้รับ:
- Brand: ${projectData.brand_name}
- Domain: ${projectData.domain}
- Focus Type: ${projectData.focus_type}
- สัดส่วน: ${JSON.stringify(projectData.focus_percentages)}
- จำนวนหน้า: ${projectData.total_pages}
- URL Style: ${projectData.url_style}
- ภาษา: ${projectData.output_language}

## URL Patterns ที่ใช้ไปแล้ว (ห้ามซ้ำ):
${existingPatterns.length > 0 ? existingPatterns.join(', ') : 'ไม่มี'}

## PRIORITY SYSTEM - สำคัญที่สุด!
ลำดับความสำคัญตาม "ความอยู่รอดของธุรกิจ" และ "User Journey ที่นำไปสู่การสมัคร"

### หน้าบังคับทุกเว็บ (Priority 1 - Must Have) - ห้ามขาด!
**ทุกเว็บต้องมีหน้าเหล่านี้เป็นอันดับแรก และต้องเป็น is_required: true**

1. / (Homepage) - Hub เชื่อมโยงทุกอย่าง
2. /register - เป้าหมายสูงสุดของเว็บ (Conversion หลัก)
3. /login - สำหรับสมาชิกเดิม
4. /contact - สร้างความน่าเชื่อถือ (มีแอดมินตอบ)
5. /promotion - ลูกค้าดูก่อนตัดสินใจสมัคร

**กฎ: 5 หน้านี้ต้องสร้างก่อนเสมอ ไม่ว่าจะเป็น Focus Type ใดก็ตาม**

---

## โครงสร้างเฉพาะตามประเภทเว็บ:

### A. เว็บหวย (Lottery Focus):

**Priority 1 (Must-Have) - สร้างก่อนเสมอ:**
- / (หน้าหลัก) - is_required: true
- /register (สมัครสมาชิก) - is_required: true
- /login (เข้าสู่ระบบ) - is_required: true
- /contact (ติดต่อเรา) - is_required: true
- /promotion (โปรโมชั่น) - is_required: true

**Priority 2 (Money Makers - หน้าที่ลูกค้ามาเล่น) - สร้างต่อจาก Priority 1:**
- /lottery (Pillar หวย)
- /lottery/yeekee (หวยยี่กี - สำคัญที่สุด เล่นได้ทั้งวัน รอบละ 15 นาที)
- /lottery/hanoi (หวยฮานอย - ยอดนิยมอันดับ 2 ออกทุกวัน)
- /lottery/lao (หวยลาว - ยอดนิยมรองลงมา)
- /lottery/thai (หวยรัฐบาล - Traffic มหาศาล วันที่ 1 และ 16)
- /rates (อัตราจ่าย - ลูกค้าเปรียบเทียบราคาจ่ายก่อนสมัคร บาทละ 900/950)

**Priority 3 (Traffic Magnets - ดึงคนจาก SEO):**
- /check-result (ตรวจผลหวย - Traffic สูงที่สุด)
- /result-history (ผลหวยย้อนหลัง)
- /dream-prediction (ทำนายฝัน - SEO คนไทยชอบมาก)
- /lucky-numbers (เลขเด็ด)

**Priority 4 (Trust & Legal):**
- /how-to-play (วิธีเล่น)
- /rules (กติกา)
- /terms (ข้อกำหนด)
- /privacy (ความเป็นส่วนตัว)
- /about (เกี่ยวกับเรา)

---

### B. เว็บคาสิโน (Casino Focus):

**Priority 1 (Must-Have) - สร้างก่อนเสมอ:**
- / (หน้าหลัก) - is_required: true
- /register (สมัครสมาชิก) - is_required: true
- /login (เข้าสู่ระบบ) - is_required: true
- /contact (ติดต่อเรา) - is_required: true
- /promotion (โปรโมชั่น - โบนัสแรกเข้า คืนยอดเสีย) - is_required: true

**Priority 2 (Main Verticals - สินค้าหลัก):**
- /casino (Pillar)
- /casino/baccarat (บาคาร่า - สำคัญที่สุด)
- /casino/roulette (รูเล็ต)
- /casino/dragontiger (เสือมังกร)
- /slots (Pillar - แยกชัดจากคาสิโน)
- /football (Pillar - แทงบอล)

**Priority 3 (Provider Pages - คนค้นหาชื่อค่าย):**
- /slots/pg (PG Slot - สำคัญที่สุดในไทย 80% ตลาด)
- /slots/joker (Joker Gaming)
- /casino/sa-gaming (SA Gaming - เจ้าพ่อบาคาร่า)
- /casino/sexy-baccarat (Sexy Baccarat)
- /slots/pragmatic (Pragmatic Play)

**Priority 4 (Engagement - ดึงคนเข้าเว็บ):**
- /demo (ทดลองเล่นฟรี)
- /formulas (สูตรบาคาร่า/สูตร AI - Unique Concept ไทย)
- /reviews (รีวิวเกม)
- /vip (ระบบ VIP)

**Priority 5 (Support):**
- /articles (บทความ)
- /download (ดาวน์โหลดแอป)
- /rules, /terms, /privacy, /about

---

### C. เว็บสล็อตเฉพาะ (Slots Only Focus):

**Priority 1 (Must-Have + Speed) - สร้างก่อนเสมอ:**
- / (หน้าหลัก) - is_required: true
- /register (สมัครสมาชิก) - is_required: true
- /login (เข้าสู่ระบบ) - is_required: true
- /contact (ติดต่อเรา) - is_required: true
- /promotion (โปรโมชั่น) - is_required: true
- **หมายเหตุ**: หน้าเหล่านี้ต้อง Load เร็วมาก เพราะคนเล่นสล็อตไม่อดทน

**Priority 2 (Provider First - คนค้นชื่อค่าย):**
- /slots (Pillar - All Games)
- /slots/pg (PG Soft - Priority สูงสุด 80% ตลาด)
- /slots/joker (Joker Gaming)
- /slots/pragmatic (Pragmatic Play)
- /slots/xo (Slot XO)
- /slots/jili (JILI - ค่ายใหม่กำลังมา)

**Priority 3 (Engagement - ฟีเจอร์เฉพาะไทย):**
- /formulas (สูตรสล็อต/AI - คนไทยเชื่อมาก)
- /demo (ทดลองเล่นฟรี)
- /jackpot (แจ็คพอตล่าสุด - ดึงความโลภ)
- /hot-games (เกมแตกง่ายวันนี้ - SEO ดี)

**Priority 4 (Game Landing Pages - เกมดัง):**
- /game/roma (โรม่า - ตำนาน)
- /game/mahjong-ways-2 (มาจอง 2)
- /game/fortune-ox (วัวทอง)
- /game/lucky-neko (เนโกะ)
- /game/treasures-of-aztec (สาวถ้ำ)

**Priority 5 (Support & Utility):**
- /download (App)
- /vip (ระบบ VIP)
- /activity (กิจกรรม)
- /ranking (อันดับคนแตก)
- /rules, /terms, /about

---

## กฎการสร้าง URL (สำคัญมาก!):

### 1. Root Level Pages (ห้ามซ้อนใน category):
- Support: /rules, /faq, /terms, /privacy, /about, /contact
- Conversion: /register, /login, /download
- Features: /promotion, /vip, /check-result, /demo, /formulas
- **เหตุผล**: เป็น Global Pages ใช้ทั้งเว็บ ไม่เฉพาะ category ใดๆ

### 2. Category Structure (Pillar + Clusters):
- **Pillar**: /lottery, /casino, /slots, /football
- **Clusters**: ต้องเกี่ยวข้องกับ Pillar โดยตรง
  - ✅ /lottery/hanoi (เกี่ยวกับหวย)
  - ✅ /slots/pg (เกี่ยวกับสล็อต)
  - ✅ /casino/baccarat (เกี่ยวกับคาสิโน)
  - ❌ /lottery/contact (contact ไม่เฉพาะหวย)

### 3. Provider Pages (สำคัญมากสำหรับ Casino/Slots):
- คนไทยค้นหาด้วย "ชื่อค่าย" เป็นหลัก
- ต้องมี Landing Page แยกของแต่ละค่ายดัง
- Format: /slots/[provider] หรือ /casino/[provider]

### 4. Game Landing Pages (สำหรับ Slots):
- เกมดังควรมีหน้าแยก
- Format: /game/[game-name]
- เลือกแค่เกมที่ดังจริงๆ (โรม่า, มาจอง, วัวทอง)

### 5. SEO Traffic Pages:
- /check-result, /dream-prediction, /formulas, /hot-games
- หน้าเหล่านี้ดัก Organic Traffic แล้วต้อนไปสมัคร

## Page Types:
- **pillar**: หน้า Parent (/lottery, /casino, /slots, /football)
- **cluster**: หน้า Child content (/lottery/hanoi, /slots/pg, /casino/baccarat)
- **conversion**: หน้า Action (/register, /login)
- **support**: หน้าสนับสนุน (/contact, /rules, /faq, /terms, /about)

## Title Pattern:
- ใช้รูปแบบ: "ชื่อไทย {brand}" เท่านั้น
- ไม่ต้องมีภาษาอังกฤษ
- ตัวอย่าง: "หวยฮานอย {brand}", "สล็อต PG {brand}"

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
      "url_path": "/register",
      "page_type": "conversion",
      "title_pattern": "สมัครสมาชิก {brand}",
      "category": "general",
      "is_required": true
    },
    {
      "url_path": "/login",
      "page_type": "conversion",
      "title_pattern": "เข้าสู่ระบบ {brand}",
      "category": "general",
      "is_required": true
    },
    {
      "url_path": "/contact",
      "page_type": "support",
      "title_pattern": "ติดต่อเรา {brand}",
      "category": "general",
      "is_required": true
    },
    {
      "url_path": "/promotion",
      "page_type": "support",
      "title_pattern": "โปรโมชั่น {brand}",
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
      "url_path": "/lottery/yeekee",
      "page_type": "cluster",
      "title_pattern": "หวยยี่กี {brand}",
      "category": "lottery",
      "is_required": false
    }
  ]
}

## การสร้างโครงสร้าง - ขั้นตอนสำคัญ:

1. **สร้าง 5 หน้าบังคับก่อนเสมอ** (/, /register, /login, /contact, /promotion) ด้วย is_required: true
2. **จากนั้นจึงสร้างหน้าตาม Priority** ตาม Focus Type ที่ระบุ
3. **ถ้าจำนวนหน้ามากกว่า 5** ให้เพิ่มหน้าตาม Priority 2, 3, 4 ตามลำดับ
4. **เลือกหน้าที่สำคัญที่สุดก่อน** เช่น เว็บหวยต้องมี /lottery/yeekee, /lottery/hanoi, /check-result
5. **ห้ามข้าม Priority 1** - ต้องมี 5 หน้าบังคับเสมอ

**สร้างโครงสร้างตาม Priority และ Focus Type ที่ได้รับ ให้ครบตามจำนวนหน้าที่ระบุ**`;

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
