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

const SESSION_STORAGE_KEY = 'bumblebee_mha_officer_session';

/**
 * Authenticate officer with strict ID and passcode checking
 */
export function authenticateOfficer(
  rawOfficerId: string,
  rawPasscode: string
): { success: boolean; officer?: OfficerProfile; error?: string } {
  const cleanId = (rawOfficerId || '').trim().toLowerCase();
  const cleanPasscode = (rawPasscode || '').trim();

  if (!cleanId) {
    return { success: false, error: 'Officer ID is required for clearance.' };
  }

  if (!cleanPasscode) {
    return { success: false, error: 'Security passcode / cryptographic key is required.' };
  }

  // Find matching officer profile
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
      error: `Access Denied: Officer ID "${rawOfficerId}" is not registered in the MHA authorized registry. Only authorized officers (hardik, kshama, alkesh) may log in.`,
    };
  }

  if (cleanPasscode !== MASTER_OFFICER_PASSCODE) {
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
