/**
 * Legal entity configuration — ONE place to update when the entity changes.
 * Future migration: Digitex Studio (Proprietorship) → Bell Orbit Technologies Pvt Ltd
 * Update only the constants below; every page and API imports from here.
 */

export const LEGAL_ENTITY = {
  name:        'Digitex Studio',
  type:        'Proprietorship',
  proprietor:  'Vishal Ashok Pendharkar',
  gstin:       '27AAAPP9753F2ZF',
  address:     'Flat No. 1204, 12th Floor, Casa Sereno B1, Mankoli Road, Off Mumbai–Nashik Highway, Anjur, Bhiwandi, Thane, Maharashtra 421302',
  grievanceEmail: 'digitex.studio@gmail.com',
  platform:    'VyaparSethu',
  domain:      'vyaparsethu.com',
  formerlyKnownAs: 'Bell24h',
} as const;

/** Version string embedded in every ConsentEvent row. Bump on material policy changes. */
export const CONSENT_TEXT_VERSION = '1.0';

export const POLICY_EFFECTIVE_DATE = '11 June 2026';
export const POLICY_LAST_UPDATED   = '19 July 2026';
