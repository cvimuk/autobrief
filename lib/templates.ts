// Page templates by category based on PRD Section 5

export const PAGE_TEMPLATES = {
  lottery: [
    { path: '/lottery', title: 'หวยออนไลน์', type: 'pillar' },
    { path: '/lottery/thai', title: 'หวยไทย', type: 'cluster' },
    { path: '/lottery/hanoi', title: 'หวยฮานอย', type: 'cluster' },
    { path: '/lottery/laos', title: 'หวยลาว', type: 'cluster' },
    { path: '/lottery/yeekee', title: 'หวยยี่กี', type: 'cluster' },
    { path: '/lottery/stock', title: 'หวยหุ้น', type: 'cluster' },
    { path: '/lottery/crypto', title: 'หวยคริปโต', type: 'cluster' },
    { path: '/results', title: 'ผลหวย', type: 'support' },
    { path: '/results/check', title: 'ตรวจหวย', type: 'support' },
    { path: '/results/live', title: 'ผลหวยสด', type: 'support' }
  ],
  casino: [
    { path: '/casino', title: 'คาสิโนออนไลน์', type: 'pillar' },
    { path: '/casino/live', title: 'คาสิโนสด', type: 'cluster' },
    { path: '/casino/baccarat', title: 'บาคาร่า', type: 'cluster' },
    { path: '/casino/roulette', title: 'รูเล็ต', type: 'cluster' },
    { path: '/casino/hilo', title: 'ไฮโล', type: 'cluster' },
    { path: '/casino/sicbo', title: 'ซิกโบ', type: 'cluster' },
    { path: '/casino/dragon-tiger', title: 'เสือมังกร', type: 'cluster' }
  ],
  slots: [
    { path: '/slots', title: 'สล็อตออนไลน์', type: 'pillar' },
    { path: '/slots/pg', title: 'สล็อต PG', type: 'cluster' },
    { path: '/slots/joker', title: 'สล็อต Joker', type: 'cluster' },
    { path: '/slots/pragmatic', title: 'สล็อต Pragmatic', type: 'cluster' },
    { path: '/slots/free-spins', title: 'สล็อตฟรีสปิน', type: 'cluster' },
    { path: '/slots/jackpot', title: 'สล็อตแจ็คพอต', type: 'cluster' }
  ],
  football: [
    { path: '/football', title: 'แทงบอลออนไลน์', type: 'pillar' },
    { path: '/football/live', title: 'แทงบอลสด', type: 'cluster' },
    { path: '/football/step', title: 'บอลสเต็ป', type: 'cluster' },
    { path: '/football/single', title: 'บอลเดี่ยว', type: 'cluster' },
    { path: '/football/today', title: 'บอลวันนี้', type: 'cluster' },
    { path: '/football/odds', title: 'ราคาบอล', type: 'cluster' },
    { path: '/football/results', title: 'ผลบอล', type: 'support' }
  ],
  general: [
    { path: '/', title: 'HOME', type: 'pillar', required: true },
    { path: '/register', title: 'สมัครสมาชิก', type: 'conversion', required: true },
    { path: '/promotion', title: 'โปรโมชั่น', type: 'support', required: true },
    { path: '/contact', title: 'ติดต่อเรา', type: 'support', required: true },
    { path: '/payment', title: 'ฝากถอน', type: 'support' },
    { path: '/wallet', title: 'Wallet', type: 'support' },
    { path: '/how-to-play', title: 'วิธีเล่น', type: 'support' },
    { path: '/about', title: 'เกี่ยวกับเรา', type: 'support' },
    { path: '/blog', title: 'บทความ', type: 'support' },
    { path: '/faq', title: 'คำถามที่พบบ่อย', type: 'support' }
  ]
};

// Flat URL style conversion
export function convertToFlatStyle(path: string, title: string): string {
  if (path === '/' || path === '/register' || path === '/promotion' || path === '/contact') {
    return path;
  }

  // Convert /lottery/hanoi -> /hanoi-lottery
  // Convert /casino/baccarat -> /baccarat-casino
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 2) {
    return `/${parts[1]}-${parts[0]}`;
  }

  return path.replace(/\//g, '-').substring(1);
}

// Get required pages
export function getRequiredPages() {
  return PAGE_TEMPLATES.general.filter(page => page.required);
}

// Get pages by category based on percentage
export function getPagesByCategory(category: string, count: number, urlStyle: 'nested' | 'flat' = 'nested') {
  const templates = PAGE_TEMPLATES[category as keyof typeof PAGE_TEMPLATES] || [];
  const selected = templates.slice(0, Math.min(count, templates.length));

  return selected.map(page => ({
    ...page,
    path: urlStyle === 'flat' ? convertToFlatStyle(page.path, page.title) : page.path
  }));
}
