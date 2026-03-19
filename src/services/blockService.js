import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Save a block (serialized element subtree) to Firestore.
 * @param {string} userId
 * @param {string} name - user-chosen name for the block
 * @param {Array} elements - portable element tree (root + descendants with relative IDs)
 * @returns {string} the new block document ID
 */
export async function saveBlock(userId, name, elements) {
  if (!userId || !name || !elements?.length) {
    throw new Error('userId, name, and elements are required to save a block');
  }

  const blocksRef = collection(db, 'users', userId, 'savedBlocks');
  const docRef = await addDoc(blocksRef, {
    name,
    thumbnail: null,
    elements,
    createdAt: serverTimestamp(),
    type: 'block',
  });

  return docRef.id;
}

/**
 * Load all saved blocks for a user.
 * @param {string} userId
 * @returns {Array<{ id, name, thumbnail, elements, createdAt, type }>}
 */
export async function loadBlocks(userId) {
  if (!userId) return [];

  const blocksRef = collection(db, 'users', userId, 'savedBlocks');
  const snapshot = await getDocs(blocksRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Delete a saved block.
 * @param {string} userId
 * @param {string} blockId
 */
export async function deleteBlock(userId, blockId) {
  if (!userId || !blockId) return;
  const blockRef = doc(db, 'users', userId, 'savedBlocks', blockId);
  await deleteDoc(blockRef);
}
