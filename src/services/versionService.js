// src/services/versionService.js
// Manages version snapshots stored at users/{userId}/projects/{projectId}/versions/{versionId}

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const VERSIONS_LIMIT = 20;

/**
 * Returns the Firestore collection reference for a project's version snapshots.
 */
function versionsCollection(userId, projectId) {
  return collection(db, 'projects', userId, 'ProjectRef', projectId, 'versions');
}

/**
 * Save a new version snapshot. Automatically trims to the last VERSIONS_LIMIT entries.
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {Array}  elements
 * @param {Array}  pages
 * @param {Object} websiteSettings
 * @param {string|null} label  Optional human-readable label (e.g. "Before redesign")
 * @returns {Promise<string>} The newly created version document ID
 */
export async function saveVersion(userId, projectId, elements, pages, websiteSettings, label = null) {
  const colRef = versionsCollection(userId, projectId);

  const versionData = {
    elements: elements || [],
    pages: pages || [],
    websiteSettings: websiteSettings || {},
    timestamp: serverTimestamp(),
    label: label || null,
  };

  const docRef = await addDoc(colRef, versionData);

  // Trim old versions beyond the limit — fetch all ordered by timestamp asc,
  // delete the oldest if we exceed VERSIONS_LIMIT.
  try {
    const allQuery = query(colRef, orderBy('timestamp', 'asc'));
    const snap = await getDocs(allQuery);
    if (snap.size > VERSIONS_LIMIT) {
      const excess = snap.size - VERSIONS_LIMIT;
      const toDelete = snap.docs.slice(0, excess);
      await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
    }
  } catch (trimErr) {
    // Non-critical — log in dev but don't throw
    if (import.meta.env.DEV) console.warn('[VersionService] Failed to trim old versions:', trimErr);
  }

  return docRef.id;
}

/**
 * Load the most recent version snapshots for a project.
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {number} max  Maximum number of versions to return (default 20)
 * @returns {Promise<Array>} Array of version objects sorted newest-first
 */
export async function loadVersions(userId, projectId, max = VERSIONS_LIMIT) {
  const colRef = versionsCollection(userId, projectId);
  const q = query(colRef, orderBy('timestamp', 'desc'), firestoreLimit(max));
  const snap = await getDocs(q);

  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      elements: data.elements || [],
      pages: data.pages || [],
      websiteSettings: data.websiteSettings || {},
      timestamp: data.timestamp?.toDate?.() || null,
      label: data.label || null,
    };
  });
}

/**
 * Load a specific version's full data.
 *
 * @param {string} versionId
 * @param {string} userId
 * @param {string} projectId
 * @returns {Promise<Object|null>} The version data or null if not found
 */
export async function restoreVersion(versionId, userId, projectId) {
  const docRef = doc(db, 'projects', userId, 'ProjectRef', projectId, 'versions', versionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    elements: data.elements || [],
    pages: data.pages || [],
    websiteSettings: data.websiteSettings || {},
    timestamp: data.timestamp?.toDate?.() || null,
    label: data.label || null,
  };
}

/**
 * Add or update a user label on a version snapshot.
 *
 * @param {string} userId
 * @param {string} projectId
 * @param {string} versionId
 * @param {string} label
 */
export async function labelVersion(userId, projectId, versionId, label) {
  const docRef = doc(db, 'projects', userId, 'ProjectRef', projectId, 'versions', versionId);
  await updateDoc(docRef, { label });
}
