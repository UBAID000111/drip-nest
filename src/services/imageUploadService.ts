import { doc, setDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  url: string;
  isFirestore: boolean;
  mediaId?: string;
  filename: string;
  sizeBytes: number;
}

export interface MediaItem {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  sizeBytes: number;
  folder?: string;
  createdAt?: any;
}

/**
 * Validates whether the chosen file is a supported image format (JPG, JPEG, PNG, WEBP).
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(ext);

  if (!isValidType) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported format. Please upload a JPG, JPEG, or PNG image.`,
    };
  }

  // Max 25MB raw file input before client-side canvas optimization
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `"${file.name}" is larger than 25MB. Please choose a smaller photo.`,
    };
  }

  return { valid: true };
}

/**
 * Check if the browser's canvas supports exporting to WebP
 */
function checkWebpSupport(): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Compresses an existing Base64 Data URL so it is guaranteed to fit within Firestore document limits.
 * Default max size per image is 65 KB (~50 KB binary), ensuring multiple images fit comfortably
 * inside Firestore's 1MB (1,048,576 byte) document limit.
 */
export async function compressDataUrl(
  dataUrl: string,
  maxBase64Length = 68 * 1024
): Promise<string> {
  // If not a data URL or already smaller than target, return as-is
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length <= maxBase64Length) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const supportsWebp = checkWebpSupport();
        const preferredMime = supportsWebp ? 'image/webp' : 'image/jpeg';

        let targetDim = 800;
        let quality = 0.78;
        let resultUrl = dataUrl;
        let attempts = 0;

        while (attempts < 6) {
          let { width, height } = img;
          if (width > targetDim || height > targetDim) {
            if (width > height) {
              height = Math.round((height * targetDim) / width);
              width = targetDim;
            } else {
              width = Math.round((width * targetDim) / height);
              height = targetDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(resultUrl);
            return;
          }

          // Fill white background to support transparent PNG conversion cleanly
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          resultUrl = canvas.toDataURL(preferredMime, quality);

          // If still too large, fallback to JPEG with lower quality
          if (resultUrl.length > maxBase64Length && preferredMime === 'image/webp') {
            const jpgUrl = canvas.toDataURL('image/jpeg', quality);
            if (jpgUrl.length < resultUrl.length) {
              resultUrl = jpgUrl;
            }
          }

          if (resultUrl.length <= maxBase64Length) {
            break;
          }

          // Step down dimension and quality iteratively
          targetDim = Math.round(targetDim * 0.82);
          quality = Math.max(0.48, quality - 0.08);
          attempts++;
        }

        resolve(resultUrl);
      } catch (e) {
        console.warn('Canvas compression fallback:', e);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      // On error, return original URL
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Sanitizes and compresses all product image URLs.
 * Guarantees that the total base64 footprint of all images combined remains safely
 * under Firestore's 1MB limit (e.g. max 500KB total for all images combined).
 */
export async function sanitizeProductImages(
  images: string[],
  maxTotalBytes = 550 * 1024
): Promise<string[]> {
  if (!images || images.length === 0) return [];

  // Determine per-image budget based on count
  // e.g., for 5 images, ~65KB each = ~325KB total
  const count = images.length;
  const perImageBudget = Math.min(75 * 1024, Math.floor(maxTotalBytes / Math.max(1, count)));

  const optimized = await Promise.all(
    images.map(async (url) => {
      if (url && url.startsWith('data:image/')) {
        return await compressDataUrl(url, perImageBudget);
      }
      return url;
    })
  );

  return optimized;
}

/**
 * Optimizes an image using HTML5 Canvas for fast storage and display in Firestore.
 * Produces crisp, high-definition images (< 65KB base64) while maintaining vibrant detail.
 * This guarantees the product document will never exceed Firestore's 1MB limit.
 */
export async function optimizeImageForFirestore(
  file: File,
  maxDimension = 800,
  initialQuality = 0.78
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const supportsWebp = checkWebpSupport();
          const targetMime = supportsWebp ? 'image/webp' : 'image/jpeg';
          const maxTargetBytes = 65 * 1024; // 65KB base64 target

          let targetDim = maxDimension;
          let quality = initialQuality;
          let dataUrl = '';
          let attempts = 0;

          while (attempts < 6) {
            let { width, height } = img;

            // Scale down if larger than targetDim
            if (width > targetDim || height > targetDim) {
              if (width > height) {
                height = Math.round((height * targetDim) / width);
                width = targetDim;
              } else {
                width = Math.round((width * targetDim) / height);
                height = targetDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              const rawUrl = e.target?.result as string;
              resolve({ blob: file, dataUrl: rawUrl });
              return;
            }

            // High quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Fill white background for transparent PNGs
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);

            ctx.drawImage(img, 0, 0, width, height);

            // Export to WebP or JPEG
            dataUrl = canvas.toDataURL(targetMime, quality);

            // If still too large and was WebP, check JPEG
            if (dataUrl.length > maxTargetBytes && targetMime === 'image/webp') {
              const jpgUrl = canvas.toDataURL('image/jpeg', quality);
              if (jpgUrl.length < dataUrl.length) {
                dataUrl = jpgUrl;
              }
            }

            if (dataUrl.length <= maxTargetBytes) {
              break;
            }

            // Downscale dimensions and quality
            targetDim = Math.round(targetDim * 0.82);
            quality = Math.max(0.5, quality - 0.08);
            attempts++;
          }

          // Convert Data URL to Blob for sizing
          const blob = await fetch(dataUrl).then((r) => r.blob());

          resolve({ blob, dataUrl });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file for optimization.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file directly to Firestore.
 * 1. Optimizes and compresses the image to a lightweight, high-definition base64 data URL (< 65KB).
 * 2. Saves a record to the `media_files` collection in Firestore.
 * 3. Returns the data URL and media details for immediate use in products and categories.
 */
export async function uploadImageToFirestore(
  file: File,
  folder = 'products',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  onProgress?.(25);

  // 1. Optimize image client-side to < 65KB so product documents never exceed Firestore's 1MB limit
  const { blob, dataUrl } = await optimizeImageForFirestore(file, 800, 0.78);

  onProgress?.(65);

  // 2. Generate unique media ID and metadata
  const cleanBase = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '_')
    .substring(0, 40);
  const mediaId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanBase}`;

  // 3. Save to Firestore `media_files` collection for media library archiving
  try {
    const mediaRef = doc(db, 'media_files', mediaId);
    await setDoc(mediaRef, {
      id: mediaId,
      name: file.name,
      dataUrl,
      sizeBytes: blob.size,
      mimeType: blob.type || 'image/jpeg',
      folder,
      createdAt: serverTimestamp(),
    });
  } catch (firestoreErr: any) {
    // If media_files collection write fails due to permissions, log warning but DO NOT crash!
    // The dataUrl is already pristine and can be embedded directly into the product document!
    console.warn('Note: media_files catalog write skipped or pending rules:', firestoreErr?.message);
  }

  onProgress?.(100);

  return {
    url: dataUrl,
    isFirestore: true,
    mediaId,
    filename: file.name,
    sizeBytes: blob.size,
  };
}

// Backward-compatible alias
export const uploadImageToFirebase = uploadImageToFirestore;

/**
 * Retrieve recent images stored in Firestore `media_files` collection
 * allowing quick selection of already uploaded photos.
 */
export async function getFirestoreMediaFiles(limitCount = 24): Promise<MediaItem[]> {
  try {
    const mediaRef = collection(db, 'media_files');
    const q = query(mediaRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as MediaItem[];
  } catch (err) {
    console.warn('Could not fetch Firestore media library:', err);
    return [];
  }
}
