import { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc, writeBatch } from '../lib/firebase';
import { Transaction, Category, AuthUser } from '../types';
import { sanitizeTransaction } from './storage';

export const syncUserToFirestore = async (user: AuthUser, openBalance: number) => {
  if (!user || !user.id) return;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      openBalance: openBalance,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync user error:', err);
  }
};

export const saveTransactionToFirestore = async (userId: string, tx: Transaction) => {
  if (!userId || !tx || !tx.id) return;
  try {
    const cleanTx = sanitizeTransaction(tx);
    const txRef = doc(db, 'users', userId, 'transactions', cleanTx.id);
    await setDoc(txRef, cleanTx);
  } catch (err) {
    console.warn('Firestore save tx error:', err);
  }
};

export const saveAllTransactionsToFirestore = async (userId: string, transactions: Transaction[]) => {
  if (!userId || !Array.isArray(transactions) || transactions.length === 0) return;
  try {
    // Firestore batch limit is 500 operations
    const CHUNK_SIZE = 400;
    for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
      const chunk = transactions.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((tx) => {
        const cleanTx = sanitizeTransaction(tx);
        const txRef = doc(db, 'users', userId, 'transactions', cleanTx.id);
        batch.set(txRef, cleanTx);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore bulk save txs error, falling back to individual writes:', err);
    // Fallback to individual setDocs if batch fails
    for (const tx of transactions) {
      await saveTransactionToFirestore(userId, tx);
    }
  }
};

export const deleteTransactionFromFirestore = async (userId: string, txId: string) => {
  if (!userId || !txId) return;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (err) {
    console.warn('Firestore delete tx error:', err);
  }
};

export const fetchTransactionsFromFirestore = async (userId: string): Promise<Transaction[]> => {
  if (!userId) return [];
  try {
    const txCol = collection(db, 'users', userId, 'transactions');
    const snapshot = await getDocs(txCol);
    const list: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      list.push(sanitizeTransaction(docSnap.data()));
    });
    return list.sort((a, b) => (b.date.localeCompare(a.date) || b.createdAt - a.createdAt));
  } catch (err) {
    console.warn('Firestore fetch tx error:', err);
    return [];
  }
};

// Smart merge of local and cloud transactions ensuring no data loss upon refresh
export const mergeTransactions = (localTxs: Transaction[], cloudTxs: Transaction[]): Transaction[] => {
  const map = new Map<string, Transaction>();

  // Add all local transactions first
  (localTxs || []).forEach((t) => {
    if (t && t.id) {
      map.set(t.id, sanitizeTransaction(t));
    }
  });

  // Merge cloud transactions (if newer or not in local)
  (cloudTxs || []).forEach((t) => {
    if (t && t.id) {
      const existing = map.get(t.id);
      if (!existing) {
        map.set(t.id, sanitizeTransaction(t));
      } else {
        // Keep the one with latest createdAt or valid info
        const cleanCloud = sanitizeTransaction(t);
        if (cleanCloud.createdAt >= existing.createdAt) {
          map.set(t.id, cleanCloud);
        }
      }
    }
  });

  const merged = Array.from(map.values());
  // Sort descending: newest date first, then highest createdAt
  return merged.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
};
