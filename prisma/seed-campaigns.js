// One-time seed: campaign rules for Week 3 VIP clusters
// Run: node prisma/seed-campaigns.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rules = [
  // ── Steel / Metals — Kalamboli ───────────────────────────────────────────
  {
    category:     'Steel',
    urgency:      'HIGH',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: 'Namaste! VyaparSethu pe aapke liye ek {{urgency}} {{category}} requirement hai — Kalamboli cluster se. Quote karo aur deal pakdo. vyaparsethu.com',
  },
  {
    category:     'Steel',
    urgency:      'NORMAL',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: 'Ek naya {{category}} requirement aaya hai VyaparSethu pe. Buyer ka text: "{{text}}". Aaj hi quote submit karo. vyaparsethu.com',
  },
  {
    category:     'Steel',
    urgency:      'URGENT',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: '⚡ URGENT {{category}} requirement — buyer 24h mein quote chahta hai. Text: "{{text}}". Abhi quote karo: vyaparsethu.com',
  },

  // ── Corrugated / Packaging — Bhiwandi ───────────────────────────────────
  {
    category:     'Corrugated',
    urgency:      'HIGH',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: 'Namaste! Bhiwandi cluster se ek {{urgency}} {{category}} packaging requirement hai VyaparSethu pe. Quote karo aaj: vyaparsethu.com',
  },
  {
    category:     'Corrugated',
    urgency:      'NORMAL',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: 'Naya {{category}} requirement: "{{text}}". Bhiwandi buyer wait kar raha hai. Quote submit karo VyaparSethu pe: vyaparsethu.com',
  },
  {
    category:     'Packaging',
    urgency:      'HIGH',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: '📦 {{urgency}} {{category}} requirement aaya — Bhiwandi se. Text: "{{text}}". VyaparSethu pe quote bhejo abhi: vyaparsethu.com',
  },

  // ── Industrial Adhesives — Navi Mumbai ──────────────────────────────────
  {
    category:     'Adhesives',
    urgency:      'HIGH',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: 'Namaste! Navi Mumbai se {{urgency}} Industrial {{category}} requirement hai. "{{text}}". VyaparSethu pe quote karo: vyaparsethu.com',
  },
  {
    category:     'Adhesives',
    urgency:      'NORMAL',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: 'Naya {{category}} requirement VyaparSethu pe: "{{text}}". Verified buyer — Protected Payment guaranteed. Quote: vyaparsethu.com',
  },
  {
    category:     'Adhesives',
    urgency:      'URGENT',
    isActive:     true,
    actionType:   'whatsapp',
    templateText: '⚡ URGENT Industrial {{category}} — Navi Mumbai buyer needs quote in 24h. "{{text}}". Abhi jaao: vyaparsethu.com',
  },
];

async function main() {
  console.log('Seeding campaign rules...');
  const created = await prisma.campaignRule.createMany({ data: rules, skipDuplicates: true });
  console.log(`✓ Created ${created.count} campaign rules`);

  const all = await prisma.campaignRule.findMany({ orderBy: { category: 'asc' } });
  all.forEach(r => console.log(`  [${r.id.slice(0,8)}] ${r.category} / ${r.urgency} → ${r.actionType}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
