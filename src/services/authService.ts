import { OfficerProfile } from '../types/screening';

export const MASTER_OFFICER_PASSCODE = '8604058608';

export interface OfficerRegistryEntry {
  canonicalId: string;
  name: string;
  badgeNumber: string;
  checkpointLocation: string;
  clearanceLevel: string;
  aliases: string[];
}

export const AUTHORIZED_OFFICERS_REGISTRY: Record<string, OfficerRegistryEntry> = {
  hardik: {
    canonicalId: 'MHA-HARDIK-7701',
    name: 'Officer Hardik',
    badgeNumber: 'MHA-INSP-7701',
    checkpointLocation: 'Indira Gandhi Int’l Airport (DEL-T3)',
    clearanceLevel: 'LEVEL-4 TOP SECRET (IMMIGRATION & BORDER INTELLIGENCE)',
    aliases: ['hardik', 'mha-hardik', 'mha-insp-7701', 'officer hardik', 'insp hardik'],
  },
  kshama: {
    canonicalId: 'MHA-KSHAMA-7702',
    name: 'Officer Kshama',
    badgeNumber: 'MHA-INSP-7702',
    checkpointLocation: 'Chhatrapati Shivaji Maharaj Int’l Airport (BOM-T2)',
    clearanceLevel: 'LEVEL-4 TOP SECRET (IMMIGRATION & BORDER INTELLIGENCE)',
    aliases: ['kshama', 'mha-kshama', 'mha-insp-7702', 'officer kshama', 'insp kshama'],
  },
  alkesh: {
    canonicalId: 'MHA-ALKESH-7703',
    name: 'Officer Alkesh',
    badgeNumber: 'MHA-INSP-7703',
    checkpointLocation: 'Kempegowda Int’l Airport (BLR-T2)',
    clearanceLevel: 'LEVEL-4 TOP SECRET (IMMIGRATION & BORDER INTELLIGENCE)',
    aliases: ['alkesh', 'mha-alkesh', 'mha-insp-7703', 'officer alkesh', 'insp alkesh'],
  },
};

export const ADMIN_CREDENTIALS = {
  username: 'Bumblebee',
  password: 'Alkesh@123',
};

export const ADMIN_OFFICER_PROFILE: OfficerProfile = {
  id: 'MHA-BUMBLEBEE-ROOT-001',
  name: 'Director Bumblebee',
  badgeNumber: 'ADMIN-APEX-001',
  checkpointLocation: 'National Command Center // Apex Telemetry Hub',
  clearanceLevel: 'LEVEL-5 ROOT DIRECTIVE (GLOBAL ADMIN & TELEMETRY)',
  isAdmin: true,
};

const SESSION_STORAGE_KEY = 'bumblebee_mha_officer_session';

/**
 * Check if the officer has Administrator privileges
 */
export function isAdminUser(officer: OfficerProfile | null): boolean {
  if (!officer) return false;
  return Boolean(officer.isAdmin || officer.id?.includes('BUMBLEBEE') || officer.name?.toLowerCase().includes('bumblebee'));
}

/**
 * Authenticate officer or administrator with strict ID and passcode checking
 */
export function authenticateOfficer(
  rawOfficerId: string,
  rawPasscode: string
): { success: boolean; officer?: OfficerProfile; error?: string } {
  const cleanId = (rawOfficerId || '').trim().toLowerCase();
  const rawCleanPasscode = (rawPasscode || '').trim();

  if (!cleanId) {
    return { success: false, error: 'Officer ID or Admin Username is required.' };
  }

  if (!rawCleanPasscode) {
    return { success: false, error: 'Security passcode / cryptographic key is required.' };
  }

  // 1. Check Super Admin Credentials (Username: Bumblebee / Pass: Alkesh@123)
  if (cleanId === 'bumblebee' || cleanId === 'admin' || cleanId === 'mha-bumblebee') {
    if (rawCleanPasscode === ADMIN_CREDENTIALS.password) {
      storeOfficerSession(ADMIN_OFFICER_PROFILE);
      return {
        success: true,
        officer: ADMIN_OFFICER_PROFILE,
      };
    } else {
      return {
        success: false,
        error: 'Administrator Clearance Rejected: Invalid security password for Bumblebee.',
      };
    }
  }

  // 2. Find matching officer profile in authorized registry
  let matchedEntry: OfficerRegistryEntry | undefined;

  for (const key of Object.keys(AUTHORIZED_OFFICERS_REGISTRY)) {
    const entry = AUTHORIZED_OFFICERS_REGISTRY[key];
    if (key === cleanId || entry.aliases.includes(cleanId) || entry.canonicalId.toLowerCase() === cleanId) {
      matchedEntry = entry;
      break;
    }
  }

  if (!matchedEntry) {
    return {
      success: false,
      error: `Access Denied: ID "${rawOfficerId}" is not recognized. For Officer access use hardik, kshama, or alkesh. For Admin access use Bumblebee.`,
    };
  }

  if (rawCleanPasscode !== MASTER_OFFICER_PASSCODE) {
    return {
      success: false,
      error: 'Security Clearance Failed: Invalid passcode for this officer ID. Access rejected.',
    };
  }

  const profile: OfficerProfile = {
    id: matchedEntry.canonicalId,
    name: matchedEntry.name,
    badgeNumber: matchedEntry.badgeNumber,
    checkpointLocation: matchedEntry.checkpointLocation,
    clearanceLevel: matchedEntry.clearanceLevel,
  };

  // Persist session
  storeOfficerSession(profile);

  return {
    success: true,
    officer: profile,
  };
}

/**
 * Get the currently persisted officer session
 */
export function getStoredOfficerSession(): OfficerProfile | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.id && parsed.name) {
      return parsed as OfficerProfile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Store authenticated officer session
 */
export function storeOfficerSession(officer: OfficerProfile): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(officer));
  } catch (err) {
    console.error('Failed to store officer session:', err);
  }
}

/**
 * Terminate officer session
 */
export function clearOfficerSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear officer session:', err);
  }
}
