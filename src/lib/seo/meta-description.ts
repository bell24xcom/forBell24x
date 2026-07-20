/**
 * Meta description generation for category, requirement, and supplier pages.
 *
 * Computed at render time from fields that already exist on the Category /
 * RFQ / User models — nothing here is persisted via a DB migration. This
 * mirrors the catalog/engine pattern used by
 * src/lib/product-intelligence and src/lib/industry-intelligence.
 *
 * All output is user-facing copy, so it follows CLAUDE.md's Word System:
 * "RFQ" never appears in generated strings (use "Requirement"/"Quotation"),
 * "Marketplace" becomes "Trade Network", GST/Udyam-verified suppliers are
 * "Verified Supplier".
 */

const META_MIN = 150;
const META_MAX = 160;

export interface CategoryMetaInput {
  name: string;
  /** Real count of open requirements in this category — never a placeholder. */
  openRequirementCount?: number;
}

export interface RequirementMetaInput {
  title: string;
  category: string;
  location?: string | null;
}

export interface SupplierMetaInput {
  companyName: string;
  location?: string | null;
  gstVerified: boolean;
  udyamVerified: boolean;
  /** Primary product/category the supplier is known for, if known. */
  primaryCategory?: string | null;
}

function clampToRange(text: string, min: number, max: number): string {
  if (text.length <= max) return text;
  const truncated = text.slice(0, max);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > min ? truncated.slice(0, lastSpace) : truncated).trimEnd();
}

export function generateForCategory({ name, openRequirementCount }: CategoryMetaInput): string {
  const countPhrase =
    typeof openRequirementCount === 'number' && openRequirementCount > 0
      ? `${openRequirementCount} open requirements — `
      : '';
  return clampToRange(
    `${name} Suppliers — GST & Udyam Verified. ${countPhrase}Get quotations in 24h on VyaparSethu.`,
    META_MIN,
    META_MAX,
  );
}

export function generateForRequirement({ title, category, location }: RequirementMetaInput): string {
  const locationPhrase = location ? ` in ${location}` : '';
  return clampToRange(
    `${title} — ${category}${locationPhrase}. Get quotations from verified suppliers on VyaparSethu.`,
    META_MIN,
    META_MAX,
  );
}

export function generateForSupplier({
  companyName,
  location,
  gstVerified,
  udyamVerified,
  primaryCategory,
}: SupplierMetaInput): string {
  const badges = [gstVerified && 'GST', udyamVerified && 'Udyam'].filter(Boolean).join(' & ');
  const trustPhrase = badges ? `${badges} Verified Supplier` : 'Supplier';
  const categoryPhrase = primaryCategory ? ` — ${primaryCategory}` : '';
  const locationPhrase = location ? ` in ${location}` : '';
  return clampToRange(
    `${companyName} — ${trustPhrase}${categoryPhrase}${locationPhrase} on VyaparSethu Trade Network.`,
    META_MIN,
    META_MAX,
  );
}

export interface MetaValidationResult {
  valid: boolean;
  length: number;
  issues: string[];
}

export function validateMetaDescription(text: string): MetaValidationResult {
  const issues: string[] = [];
  if (text.length < META_MIN) issues.push(`Too short (${text.length} chars, minimum ${META_MIN}).`);
  if (text.length > META_MAX) issues.push(`Too long (${text.length} chars, maximum ${META_MAX}).`);
  if (/rfq/i.test(text)) issues.push('Contains "RFQ" — Word System requires "Requirement"/"Quotation".');
  if (/\bmarketplace\b/i.test(text)) issues.push('Contains "Marketplace" — Word System requires "Trade Network".');
  return { valid: issues.length === 0, length: text.length, issues };
}
