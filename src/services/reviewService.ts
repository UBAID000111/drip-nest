import {
  collection,
  doc,
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
import { Review } from '../types';

const COLLECTION = 'reviews';

export async function getApprovedReviews(productId?: string): Promise<{
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}> {
  try {
    const collRef = collection(db, COLLECTION);
    let snap;
    let q;
    try {
      if (productId) {
        q = query(
          collRef,
          where('status', '==', 'approved'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collRef,
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
      }
      snap = await getDocs(q);
    } catch (err: any) {
      if (err?.message && err.message.includes('requires an index')) {
        const fallbackQ = productId
          ? query(collRef, where('status', '==', 'approved'), where('productId', '==', productId))
          : query(collRef, where('status', '==', 'approved'));
        snap = await getDocs(fallbackQ);
      } else {
        throw err;
      }
    }

    let reviews: Review[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        displayName: data.displayName,
        rating: data.rating,
        comment: data.comment,
        productId: data.productId,
        productName: data.productName,
        status: data.status,
        createdAt: data.createdAt,
      };
    });

    reviews.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tB - tA;
    });

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

    return {
      reviews,
      averageRating,
      totalReviews,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}

export async function getAllReviewsForAdmin(
  statusFilter?: 'all' | 'pending' | 'approved' | 'hidden'
): Promise<Review[]> {
  try {
    const collRef = collection(db, COLLECTION);
    let snap;

    try {
      let q;
      if (statusFilter && statusFilter !== 'all') {
        q = query(collRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
      } else {
        q = query(collRef, orderBy('createdAt', 'desc'));
      }
      snap = await getDocs(q);
    } catch (err: any) {
      if (err?.message && err.message.includes('requires an index')) {
        const fallbackQ = statusFilter && statusFilter !== 'all'
          ? query(collRef, where('status', '==', statusFilter))
          : collRef;
        snap = await getDocs(fallbackQ);
      } else {
        throw err;
      }
    }

    let result = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Review));

    result.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tB - tA;
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${COLLECTION}/admin`);
  }
}

export async function submitReview(data: {
  displayName: string;
  email: string;
  rating: number;
  comment: string;
  productId?: string;
  productName?: string;
}): Promise<string> {
  try {
    // Sanitization & bounds strictly complying with firestore.rules:
    // displayName: string >= 2 and <= 60
    const cleanDisplayName = data.displayName.trim().slice(0, 60);
    if (cleanDisplayName.length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }

    // email: string <= 254 (required in keys().hasAll)
    const cleanEmail = (data.email || 'customer@dripnest.com').trim().slice(0, 254);

    // comment: string >= 5 and <= 1500
    const cleanComment = data.comment.trim().slice(0, 1500);
    if (cleanComment.length < 5) {
      throw new Error('Review comment must be at least 5 characters.');
    }

    // rating: integer >= 1 and <= 5
    const intRating = Math.min(Math.max(Math.round(Number(data.rating)), 1), 5);

    // Payload construction
    const payload: Record<string, any> = {
      displayName: cleanDisplayName,
      email: cleanEmail,
      rating: intRating,
      comment: cleanComment,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    if (data.productId && typeof data.productId === 'string' && data.productId.trim().length > 0) {
      payload.productId = data.productId.trim();
    }

    if (data.productName && typeof data.productName === 'string' && data.productName.trim().length > 0) {
      payload.productName = data.productName.trim();
    }

    const docRef = await addDoc(collection(db, COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION);
  }
}

export async function moderateReview(id: string, status: 'approved' | 'hidden'): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      status,
      moderatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${id}`);
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION}/${id}`);
  }
}
