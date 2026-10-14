import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { sanitizeProductImages } from './imageUploadService';

const COLLECTION = 'products';

export interface ProductQueryResult {
  products: Product[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
}

export async function getProducts(options: {
  categoryId?: string;
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc' | 'name';
  limitCount?: number;
  lastVisibleDoc?: DocumentSnapshot | null;
  onlyActive?: boolean;
  searchTerm?: string;
} = {}): Promise<ProductQueryResult> {
  const {
    categoryId,
    sortBy = 'newest',
    limitCount = 12,
    lastVisibleDoc = null,
    onlyActive = true,
    searchTerm,
  } = options;

  try {
    const collRef = collection(db, COLLECTION);
    const constraints: any[] = [];

    if (onlyActive) {
      constraints.push(where('status', '==', 'active'));
    }

    if (categoryId && categoryId !== 'all') {
      constraints.push(where('categoryId', '==', categoryId));
    }

    if (sortBy === 'priceAsc') {
      constraints.push(orderBy('price', 'asc'));
    } else if (sortBy === 'priceDesc') {
      constraints.push(orderBy('price', 'desc'));
    } else if (sortBy === 'name') {
      constraints.push(orderBy('name', 'asc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    if (lastVisibleDoc) {
      constraints.push(startAfter(lastVisibleDoc));
    }

    constraints.push(limit(limitCount + 1));

    let snapshot;
    let usedFallback = false;

    try {
      const q = query(collRef, ...constraints);
      snapshot = await getDocs(q);
    } catch (queryErr: any) {
      if (queryErr?.message && queryErr.message.includes('requires an index')) {
        console.warn('Firestore composite index not yet active. Using simple query + in-memory sort.');
        usedFallback = true;
        const fallbackConstraints: any[] = [];
        if (onlyActive) {
          fallbackConstraints.push(where('status', '==', 'active'));
        }
        if (categoryId && categoryId !== 'all') {
          fallbackConstraints.push(where('categoryId', '==', categoryId));
        }
        fallbackConstraints.push(limit(50));
        const fallbackQuery = query(collRef, ...fallbackConstraints);
        snapshot = await getDocs(fallbackQuery);
      } else if (!onlyActive && (queryErr?.code === 'permission-denied' || queryErr?.message?.includes('permission') || queryErr?.message?.includes('permissions'))) {
        console.warn('Listing inactive products restricted by database rules. Falling back to active products.');
        usedFallback = true;
        const fallbackQuery = query(collRef, where('status', '==', 'active'), limit(50));
        snapshot = await getDocs(fallbackQuery);
      } else {
        throw queryErr;
      }
    }

    const docs = snapshot.docs;
    const hasMore = !usedFallback && docs.length > limitCount;
    const resultDocs = (!usedFallback && hasMore) ? docs.slice(0, limitCount) : docs;
    const lastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    let products: Product[] = resultDocs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Product));

    if (usedFallback) {
      if (sortBy === 'priceAsc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'priceDesc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        products.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        products.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
      }
    }

    // Optional client-side search filtering if searchTerm specified
    if (searchTerm && searchTerm.trim().length > 0) {
      const term = searchTerm.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.categoryName?.toLowerCase().includes(term)
      );
    }

    return {
      products,
      lastVisible: lastDoc,
      hasMore,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/slug/${slug}`);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/${id}`);
  }
}

export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    if (excludeId) {
      return snap.docs.some(d => d.id !== excludeId);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/check-slug`);
  }
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
  try {
    let images = productData.images || [];
    if (images.length > 0) {
      images = await sanitizeProductImages(images);
    }

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...productData,
      images,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION);
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  try {
    let payload = { ...productData };
    if (payload.images && payload.images.length > 0) {
      payload.images = await sanitizeProductImages(payload.images);
    }

    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${id}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION}/${id}`);
  }
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limitCount = 4): Promise<Product[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('categoryId', '==', categoryId),
      where('status', '==', 'active'),
      limit(limitCount + 1)
    );
    const snap = await getDocs(q);
    return snap.docs
      .filter(d => d.id !== excludeProductId)
      .slice(0, limitCount)
      .map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${COLLECTION}/related`);
  }
}
