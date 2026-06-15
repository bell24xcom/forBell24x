-- Seed: initial campaign rules for Week 3 VIP clusters
-- Steel/Metals Kalamboli · Corrugated/Packaging Bhiwandi · Industrial Adhesives Navi Mumbai
-- ON CONFLICT DO NOTHING makes this idempotent (safe to re-run).

INSERT INTO campaign_rules (id, is_active, category, urgency, template_text, action_type, created_at, updated_at)
VALUES
  -- Steel / Metals — Kalamboli
  (gen_random_uuid()::TEXT, true, 'Steel',      'HIGH',   'Namaste! VyaparSethu pe aapke liye ek {{urgency}} {{category}} requirement hai — Kalamboli cluster se. Quote karo aur deal pakdo. vyaparsethu.com',                       'whatsapp', NOW(), NOW()),
  (gen_random_uuid()::TEXT, true, 'Steel',      'NORMAL', 'Ek naya {{category}} requirement aaya hai VyaparSethu pe. Buyer ka text: "{{text}}". Aaj hi quote submit karo. vyaparsethu.com',                                           'whatsapp', NOW(), NOW()),
  (gen_random_uuid()::TEXT, true, 'Steel',      'URGENT', '⚡ URGENT {{category}} requirement — buyer 24h mein quote chahta hai. Text: "{{text}}". Abhi quote karo: vyaparsethu.com',                                                  'whatsapp', NOW(), NOW()),

  -- Corrugated / Packaging — Bhiwandi
  (gen_random_uuid()::TEXT, true, 'Corrugated', 'HIGH',   'Namaste! Bhiwandi cluster se ek {{urgency}} {{category}} packaging requirement hai VyaparSethu pe. Quote karo aaj: vyaparsethu.com',                                       'whatsapp', NOW(), NOW()),
  (gen_random_uuid()::TEXT, true, 'Corrugated', 'NORMAL', 'Naya {{category}} requirement: "{{text}}". Bhiwandi buyer wait kar raha hai. Quote submit karo VyaparSethu pe: vyaparsethu.com',                                           'whatsapp', NOW(), NOW()),
  (gen_random_uuid()::TEXT, true, 'Packaging',  'HIGH',   '📦 {{urgency}} {{category}} requirement aaya — Bhiwandi se. Text: "{{text}}". VyaparSethu pe quote bhejo abhi: vyaparsethu.com',                                           'whatsapp', NOW(), NOW()),

  -- Industrial Adhesives — Navi Mumbai
  (gen_random_uuid()::TEXT, true, 'Adhesives',  'HIGH',   'Namaste! Navi Mumbai se {{urgency}} Industrial {{category}} requirement hai. "{{text}}". VyaparSethu pe quote karo: vyaparsethu.com',                                      'whatsapp', NOW(), NOW()),
  (gen_random_uuid()::TEXT, true, 'Adhesives',  'NORMAL', 'Naya {{category}} requirement VyaparSethu pe: "{{text}}". Verified buyer — Protected Payment guaranteed. Quote: vyaparsethu.com',                                           'whatsapp', NOW(), NOW()),
  (gen_random_uuid()::TEXT, true, 'Adhesives',  'URGENT', '⚡ URGENT Industrial {{category}} — Navi Mumbai buyer needs quote in 24h. "{{text}}". Abhi jaao: vyaparsethu.com',                                                         'whatsapp', NOW(), NOW());
