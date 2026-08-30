/**
 * Bell24h transactional email templates.
 * All templates use inline styles for maximum email client compatibility.
 */

const BASE_STYLE = `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;`;
const HEADER_STYLE = `background: linear-gradient(135deg, #1E40AF, #2563EB); padding: 20px 24px; text-align: center;`;
const BODY_STYLE = `padding: 28px 24px; background: #f8fafc;`;
const FOOTER_STYLE = `background: #f1f5f9; padding: 16px 24px; text-align: center; color: #64748b; font-size: 12px;`;
const CTA_STYLE = `display: inline-block; background: #2563EB; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; margin: 16px 0;`;
const CARD_STYLE = `background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 16px 0;`;
const FOOTER_CONTENT = `VyaparSethu · India's B2B Trade Network<br>Formerly Bell24h | Digitex Studio | GSTIN: 27AAAPP9753F2ZF<br><a href="https://vyaparsethu.com" style="color: #2563EB; text-decoration: none;">vyaparsethu.com</a>`;

export function quoteReceivedEmail(buyerName: string, rfqTitle: string, supplierName: string, supplierCompany: string, price: number) {
  return {
    subject: `New Quote Received for "${rfqTitle}"`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color: white; margin: 0; font-size: 22px;">🔔 Bell24h</h1>
    <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">New Quote Received</p>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color: #1e293b; margin-top: 0;">Hi ${buyerName || 'there'},</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
      Good news! <strong>${supplierName || supplierCompany || 'A supplier'}</strong> has submitted a quote for your RFQ.
    </p>
    <div style="${CARD_STYLE}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">FOR RFQ</p>
      <p style="font-weight: bold; font-size: 16px; color: #1e293b; margin: 0 0 12px;">${rfqTitle}</p>
      <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">QUOTED PRICE</p>
      <p style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 0;">₹${price.toLocaleString('en-IN')}</p>
    </div>
    <p style="color: #475569; font-size: 14px;">Review the quote, compare with others, and accept when ready. Your payment is protected by Bell24h escrow.</p>
    <div style="text-align: center;">
      <a href="https://bell24h.com/dashboard/quotes" style="${CTA_STYLE}">View Quote →</a>
    </div>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

export function quoteAcceptedEmail(supplierName: string, rfqTitle: string, price: number) {
  return {
    subject: `🎉 Your Quote Was Accepted — "${rfqTitle}"`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color: white; margin: 0; font-size: 22px;">🔔 Bell24h</h1>
    <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">Quote Accepted!</p>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color: #1e293b; margin-top: 0;">Congratulations, ${supplierName || 'Supplier'}!</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
      The buyer has accepted your quote. A deal has been created and payment is being arranged.
    </p>
    <div style="${CARD_STYLE}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">DEAL CREATED</p>
      <p style="font-weight: bold; font-size: 16px; color: #1e293b; margin: 0 0 12px;">${rfqTitle}</p>
      <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">YOUR QUOTE PRICE</p>
      <p style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 0;">₹${price.toLocaleString('en-IN')}</p>
    </div>
    <p style="color: #475569; font-size: 14px;">Please proceed with fulfilling the order. Once the buyer confirms delivery, payment will be released to your wallet.</p>
    <div style="text-align: center;">
      <a href="https://bell24h.com/supplier/my-quotes" style="${CTA_STYLE}">View Deal →</a>
    </div>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

export function dealCompletedEmail(name: string, rfqTitle: string, amount: number, role: 'buyer' | 'supplier') {
  const isBuyer = role === 'buyer';
  return {
    subject: `Deal Completed — "${rfqTitle}"`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color: white; margin: 0; font-size: 22px;">🔔 Bell24h</h1>
    <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">Deal Completed ✓</p>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color: #1e293b; margin-top: 0;">Hi ${name || 'there'},</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
      ${isBuyer
        ? 'Your deal has been marked as completed. Thank you for using Bell24h!'
        : `The buyer has confirmed delivery. Your payment of ₹${amount.toLocaleString('en-IN')} has been released to your wallet.`
      }
    </p>
    <div style="${CARD_STYLE}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">DEAL</p>
      <p style="font-weight: bold; font-size: 16px; color: #1e293b; margin: 0 0 12px;">${rfqTitle}</p>
      <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">${isBuyer ? 'AMOUNT PAID' : 'AMOUNT RECEIVED'}</p>
      <p style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 0;">₹${amount.toLocaleString('en-IN')}</p>
    </div>
    <div style="text-align: center;">
      <a href="https://bell24h.com/dashboard" style="${CTA_STYLE}">View Dashboard →</a>
    </div>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

// ─── Supplier onboarding drip templates ──────────────────────────────────────

const ORANGE_HEADER = `background:linear-gradient(135deg,#EA580C,#F97316);padding:20px 24px;text-align:center;`;
const ORANGE_CTA = `display:inline-block;background:#F97316;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;`;

/**
 * Sent immediately when an unclaimed supplier registers and claims their profile.
 */
export function supplierWelcomeEmail(name: string, company: string, claimUrl: string) {
  return {
    subject: `Welcome to VyaparSethu — your supplier profile is live`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${ORANGE_HEADER}">
    <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
    <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">Your profile is live!</p>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color:#1e293b;margin-top:0;">Welcome, ${name || company || 'there'}!</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Your <strong>${company || 'supplier'}</strong> profile is now active on VyaparSethu — India's B2B Trade Network.
    </p>
    <div style="${CARD_STYLE}">
      <p style="margin:0 0 8px;color:#64748b;font-size:13px;">NEXT STEPS</p>
      <ul style="color:#475569;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li>Complete your profile (add GST, product photos, description)</li>
        <li>Browse open Quotation Requests in your category</li>
        <li>Submit your first quote — buyers prefer verified suppliers</li>
      </ul>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${claimUrl}" style="${ORANGE_CTA}">Go to My Profile →</a>
    </div>
    <p style="color:#94A3B8;font-size:13px;">Questions? Reply to this email — we're a small team and we read every message.</p>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

/**
 * Sent Day 3 after registration if profile is still incomplete.
 */
export function supplierProfileReminderEmail(name: string, company: string, category: string, profileUrl: string) {
  return {
    subject: `Complete your profile — buyers searching for ${category}`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${ORANGE_HEADER}">
    <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
    <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">Profile reminder</p>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color:#1e293b;margin-top:0;">Hi ${name || company || 'there'},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Buyers are searching for <strong>${category}</strong> suppliers right now, but your <strong>${company || 'profile'}</strong> is still incomplete.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Profiles with a description and category details receive <strong>3× more Quotation Requests</strong>.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${profileUrl}" style="${ORANGE_CTA}">Complete My Profile →</a>
    </div>
    <p style="color:#94A3B8;font-size:13px;">Takes under 2 minutes. No payment required.</p>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

/**
 * Sent Day 7 after registration if supplier hasn't submitted their first quote.
 */
export function supplierFirstQuoteEmail(name: string, company: string, category: string, rfqUrl: string) {
  return {
    subject: `New Quotation Requests in ${category} — submit your first quote`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${ORANGE_HEADER}">
    <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
    <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">New opportunities waiting</p>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color:#1e293b;margin-top:0;">Hi ${name || company || 'there'},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Buyers posted new Quotation Requests in <strong>${category}</strong> this week. You're listed but haven't submitted any quotes yet.
    </p>
    <div style="${CARD_STYLE}">
      <p style="margin:0;color:#64748b;font-size:13px;">DID YOU KNOW?</p>
      <p style="color:#1e293b;font-weight:bold;margin:8px 0 0;">Suppliers who quote within 7 days close 3× more deals.</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${rfqUrl}" style="${ORANGE_CTA}">Browse Quotation Requests →</a>
    </div>
    <p style="color:#94A3B8;font-size:13px;">Quoting is free. Payment is only needed when a deal is accepted.</p>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

// ─── User welcome (existing) ──────────────────────────────────────────────────

export function welcomeEmail(name: string, phone: string) {
  return {
    subject: 'Welcome to Bell24h — Your B2B Marketplace',
    html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color: white; margin: 0; font-size: 22px;">🚀 Welcome to Bell24h!</h1>
  </div>
  <div style="${BODY_STYLE}">
    <h2 style="color: #1e293b; margin-top: 0;">Hi ${name || 'there'}! 👋</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
      Welcome to India's AI-powered B2B procurement platform. Your account is ready.
    </p>
    <div style="${CARD_STYLE}">
      <p style="margin: 0 0 12px; font-size: 14px; color: #1e293b; font-weight: bold;">What you can do on Bell24h:</p>
      <ul style="color: #475569; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
        <li>🎤 Post RFQs using Voice, Video, or Text</li>
        <li>🤖 Get AI-matched with verified suppliers</li>
        <li>🔒 Safe payments with escrow protection</li>
        <li>💰 Digital wallet for fast transactions</li>
      </ul>
    </div>
    <div style="text-align: center;">
      <a href="https://bell24h.com/dashboard" style="${CTA_STYLE}">Go to Dashboard →</a>
    </div>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}
