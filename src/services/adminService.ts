import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

const ADMIN_COLLECTION = 'admins';
export const DESIGNATED_ADMIN_EMAIL = 'ubaidji07@gmail.com';

export async function checkIsAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (!uid) return false;

  try {
    const adminDocRef = doc(db, ADMIN_COLLECTION, uid);
    const snap = await getDoc(adminDocRef);

    if (snap.exists() && snap.data()?.role === 'admin') {
      return true;
    }

    // Provision admin if user matches designated admin email
    if (email && email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
      await ensureAdminProvisioned(uid, email);
      return true;
    }

    return false;
  } catch (error) {
    // If permission fails, user is not admin
    if (email && email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
    return false;
  }
}

export async function ensureAdminProvisioned(uid: string, email: string): Promise<boolean> {
  if (!uid || !email) return false;
  try {
    const adminDocRef = doc(db, ADMIN_COLLECTION, uid);
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, {
        role: 'admin',
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
      });
    }
    return true;
  } catch (err) {
    console.warn('Admin provisioning note:', err);
    return false;
  }
}
