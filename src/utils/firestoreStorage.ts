import { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from '../lib/firebase';
import { Transaction, Category, AuthUser } from '../types';

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
  if (!userId) return;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, tx);
  } catch (err) {
    console.warn('Firestore save tx error:', err);
  }
};

export const deleteTransactionFromFirestore = async (userId: string, txId: string) => {
  if (!userId) return;
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
      list.push(docSnap.data() as Transaction);
    });
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.warn('Firestore fetch tx error:', err);
    return [];
  }
};
