import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Category } from '../types';

const COLLECTION = 'categories';

export const INITIAL_CATEGORIES = [
  {
    name: 'Kitchen and Home Accessories',
    slug: 'kitchen-and-home-accessories',
    description: 'Artisanal wooden cutting boards, tissue holders, knife blocks, and natural kitchen storage designed for daily utility.',
    sortOrder: 1,
    active: true,
  },
  {
    name: 'Drinkware',
    slug: 'drinkware',
    description: 'Sculpted wooden tumblers, coasters, artisanal tea saucers, and drinking vessels handcrafted with natural walnut & teak.',
    sortOrder: 2,
    active: true,
  },
  {
    name: 'Dining',
    slug: 'dining',
    description: 'Hand-carved wooden platters, salad servers, dining bowls, and textured centerpieces that elevate every meal.',
    sortOrder: 3,
    active: true,
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Organic wooden candle stands, decorative sculptures, pedestal risers, and handcrafted accents bringing nature into your living spaces.',
    sortOrder: 4,
    active: true,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Catch-all trays, minimalist desk organizers, keepsake boxes, and wooden accents created for refined living.',
    sortOrder: 5,
    active: true,
  },
];

export async function getCategories(onlyActive = true): Promise<Category[]> {
  try {
    const collRef = collection(db, COLLECTION);
    let snap: any;

    if (onlyActive) {
      try {
        snap = await getDocs(query(collRef, where('active', '==', true)));
      } catch {
        snap = await getDocs(collRef);
      }
    } else {
      try {
        snap = await getDocs(collRef);
      } catch (adminErr) {
        // If unpermitted to list full collection (e.g. security rules require active == true),
        // gracefully fall back to active categories query
        console.warn('Falling back to active categories query:', adminErr);
        try {
          snap = await getDocs(query(collRef, where('active', '==', true)));
        } catch {
          // If Firestore is completely inaccessible, return default categories
          return INITIAL_CATEGORIES.map((c, i) => ({ ...c, id: `cat-${i + 1}` }));
        }
      }
    }

    let cats: Category[] = (snap?.docs || []).map((docSnap: any) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Category));

    if (onlyActive) {
      cats = cats.filter((c) => c.active !== false);
    }

    if (cats.length === 0) {
      return INITIAL_CATEGORIES.map((c, i) => ({ ...c, id: `cat-${i + 1}` }));
    }

    return cats.sort((a, b) => (Number(a.sortOrder || 0)) - (Number(b.sortOrder || 0)));
  } catch (error) {
    console.warn('Using default categories due to Firestore access restrictions:', error);
    return INITIAL_CATEGORIES.map((c, i) => ({ ...c, id: `cat-${i + 1}` }));
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snapshotDoc(snap.docs[0]);
    return docSnap;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/slug/${slug}`);
  }
}

function snapshotDoc(docSnap: any): Category {
  return { id: docSnap.id, ...docSnap.data() } as Category;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Category;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/${id}`);
  }
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION);
  }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION}/${id}`);
  }
}

// Checks if category has any associated products before deletion
export async function canDeleteCategory(categoryId: string): Promise<{ canDelete: boolean; productCount: number }> {
  try {
    const q = query(collection(db, 'products'), where('categoryId', '==', categoryId));
    const snap = await getDocs(q);
    return {
      canDelete: snap.empty,
      productCount: snap.size,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `products/check-category/${categoryId}`);
  }
}

export async function seedInitialCategoriesIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    if (!snap.empty) return false;

    for (const cat of INITIAL_CATEGORIES) {
      await addDoc(collection(db, COLLECTION), {
        ...cat,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (error) {
    console.error('Error seeding initial categories:', error);
    return false;
  }
}
