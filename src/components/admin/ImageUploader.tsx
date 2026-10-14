import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  MoveLeft,
  MoveRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Camera,
  Copy,
  Info,
  FolderOpen,
} from 'lucide-react';
import {
  uploadImageToFirestore,
  validateImageFile,
  getFirestoreMediaFiles,
  MediaItem,
  compressDataUrl,
} from '../../services/imageUploadService';
import { SafeImage } from '../common/SafeImage';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  multiple?: boolean;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  folder = 'products',
  multiple = true,
  label = 'Product Photography',
  helperText = 'Upload JPG, JPEG, or PNG photos. Images are optimized and stored directly in your Firestore database.',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [currentFileIndex, setCurrentFileIndex] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Firestore Media Library drawer/modal
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load Firestore media library when opened
  const handleOpenLibrary = async () => {
    setShowLibrary(true);
    setLoadingLibrary(true);
    try {
      const items = await getFirestoreMediaFiles(30);
      setLibraryItems(items);
    } catch (e) {
      console.warn('Failed to load library items:', e);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleSelectFromLibrary = (dataUrl: string) => {
    if (multiple) {
      if (!images.includes(dataUrl)) {
        onChange([...images, dataUrl]);
      }
    } else {
      onChange([dataUrl]);
      setShowLibrary(false);
    }
  };

  // File selection handler
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const val = validateImageFile(file);
      if (!val.valid) {
        setError(val.error || 'Invalid file format.');
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setCurrentFileIndex({ current: 1, total: validFiles.length });

    const newUrls: string[] = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setCurrentFileIndex({ current: i + 1, total: validFiles.length });

        // Save directly to Firestore
        const result = await uploadImageToFirestore(file, folder, (pct) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: pct }));
        });

        newUrls.push(result.url);
      }

      if (multiple) {
        onChange([...images, ...newUrls]);
      } else {
        onChange([newUrls[0]]);
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      const msg = err?.message || 'Failed to save image to Firestore.';
      setError(msg);
    } finally {
      setUploading(false);
      setCurrentFileIndex(null);
      setUploadProgress({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Drag & drop handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Add manual URL
  const handleAddManualUrl = async () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    let finalUrl = trimmed;
    if (trimmed.startsWith('data:image/')) {
      finalUrl = await compressDataUrl(trimmed, 65 * 1024);
    }
    if (multiple) {
      onChange([...images, finalUrl]);
    } else {
      onChange([finalUrl]);
    }
    setManualUrl('');
    setShowUrlInput(false);
  };

  // Re-ordering and deletion
  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const copyFirestoreRules = () => {
    const rules = `// Add this to your firestore.rules in Firebase Console:
match /media_files/{mediaId} {
  allow read: if true;
  allow create, update, delete: if signedIn() && request.auth.token.email.lower() == "ubaidji07@gmail.com";
}`;
    navigator.clipboard.writeText(rules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631]">
              {label}
            </label>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
              Firestore Storage
            </span>
          </div>
          <p className="text-xs text-[#252A24]/70 mt-0.5">{helperText}</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleOpenLibrary}
            className="text-xs text-[#234737] hover:text-[#1A3529] font-medium flex items-center gap-1 px-2.5 py-1 bg-white border border-[#EFE6D7] rounded-md hover:bg-[#F8F5EF]"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Media Library</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-[#234737] hover:underline flex items-center gap-1 font-medium"
          >
            {showUrlInput ? 'Hide link input' : 'Paste web link'}
          </button>

          <span className="text-xs text-[#684631] font-mono bg-[#F8F5EF] px-2 py-0.5 rounded border border-[#EFE6D7]">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
        </div>
      </div>

      {/* Manual URL Input */}
      {showUrlInput && (
        <div className="p-3 bg-[#F8F5EF] border border-[#EFE6D7] rounded-lg space-y-2">
          <label className="block text-[11px] font-medium text-[#252A24]">
            Paste an external image link URL:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-2 bg-white border border-[#EFE6D7] rounded-md text-xs text-[#252A24] focus:outline-none focus:border-[#234737]"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="px-4 py-2 bg-[#234737] text-white text-xs font-semibold rounded-md hover:bg-[#1A3529] shrink-0"
            >
              Add Link
            </button>
          </div>
        </div>
      )}

      {/* Main Drag-and-Drop / Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragging
            ? 'border-[#234737] bg-[#234737]/5 scale-[0.99]'
            : 'border-[#D9CDB8] bg-[#FAF8F5] hover:border-[#234737]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />

        {/* Camera direct input on mobile devices */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="py-4 space-y-3">
            <Loader2 className="w-8 h-8 text-[#234737] animate-spin mx-auto" />
            <div className="text-sm font-medium text-[#234737]">
              Optimizing & saving to Firestore...{' '}
              {currentFileIndex && (
                <span className="text-xs text-[#684631]">
                  ({currentFileIndex.current} of {currentFileIndex.total})
                </span>
              )}
            </div>
            <div className="max-w-xs mx-auto space-y-1.5">
              {Object.entries(uploadProgress).map(([fileName, pct]) => (
                <div key={fileName} className="text-left text-xs">
                  <div className="flex justify-between text-[11px] text-[#252A24]/70 mb-0.5 truncate">
                    <span className="truncate">{fileName}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-[#EFE6D7] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#234737] h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-[#252A24]">
                Choose photos or drag & drop here
              </p>
              <p className="text-xs text-[#252A24]/60 mt-0.5">
                Upload JPG, JPEG, or PNG files directly into Firestore
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#234737] text-white text-xs font-semibold rounded-md hover:bg-[#1A3529] inline-flex items-center gap-1.5 shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload JPG / JPEG / PNG</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3.5 py-2 bg-white border border-[#EFE6D7] text-[#252A24] text-xs font-medium rounded-md hover:bg-[#F8F5EF] inline-flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[#684631]" />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice:</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="text-xs underline font-semibold text-red-800 shrink-0 ml-2"
          >
            Rules Info
          </button>
        </div>
      )}

      {/* Image Gallery / Thumbnails */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#252A24]/70">
            <span>Uploaded Images (first image is primary cover):</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-red-600 hover:underline text-[11px]"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((imgUrl, idx) => {
              const isDataUrl = imgUrl.startsWith('data:');

              return (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-[#EFE6D7] bg-[#F8F5EF] shadow-xs"
                >
                  <SafeImage
                    src={imgUrl}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-[#234737] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}

                  {/* Firestore storage badge */}
                  {isDataUrl && (
                    <span
                      title="Stored directly in Firestore"
                      className="absolute bottom-2 left-2 bg-emerald-800/85 backdrop-blur-xs text-white text-[8px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                      <span>Firestore</span>
                    </span>
                  )}

                  {/* Hover Controls */}
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'left')}
                        className="p-1.5 bg-white text-[#252A24] rounded-md hover:bg-[#F8F5EF] shadow-xs"
                        title="Move Left"
                      >
                        <MoveLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'right')}
                        className="p-1.5 bg-white text-[#252A24] rounded-md hover:bg-[#F8F5EF] shadow-xs"
                        title="Move Right"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!isDataUrl && (
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white text-[#252A24] rounded-md hover:bg-[#F8F5EF] shadow-xs"
                        title="Open full size"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-xs"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Firestore Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#EFE6D7] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE6D7]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#234737]" />
                <h3 className="font-serif text-lg font-semibold text-[#234737]">
                  Firestore Media Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#252A24]/70">
              Select any previously uploaded photo from Firestore to add to this product:
            </p>

            <div className="flex-1 overflow-y-auto min-h-[220px]">
              {loadingLibrary ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="w-6 h-6 text-[#234737] animate-spin" />
                  <span className="text-xs text-[#252A24]/60">Loading photos from Firestore...</span>
                </div>
              ) : libraryItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#252A24]/60 space-y-2">
                  <ImageIcon className="w-8 h-8 text-[#252A24]/30 mx-auto" />
                  <p>No photos stored in the library yet.</p>
                  <p className="text-[11px] text-[#684631]">
                    Upload a JPG, JPEG, or PNG above to automatically populate your media library!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                  {libraryItems.map((item) => {
                    const isSelected = images.includes(item.dataUrl);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectFromLibrary(item.dataUrl)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#234737] ring-2 ring-[#234737]'
                            : 'border-[#EFE6D7] hover:border-[#234737]/60'
                        }`}
                      >
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-[#234737] text-white p-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#EFE6D7]">
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="px-4 py-2 bg-[#234737] text-white text-xs font-semibold rounded-md hover:bg-[#1A3529]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Enhancement Info Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#EFE6D7]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#234737]" />
                <h3 className="font-serif text-lg font-semibold text-[#234737]">
                  Firestore Security Rules
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#252A24]/80 leading-relaxed">
              Your images are saved directly to <strong>Firestore</strong>. To enable the optional Media Library catalog, make sure your Firestore Rules in Firebase Console include the <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">media_files</code> rule:
            </p>

            <div className="relative">
              <pre className="bg-[#1E293B] text-gray-200 text-[11px] font-mono p-3 rounded-lg overflow-x-auto leading-relaxed">
{`// Media Files: product and category images
match /media_files/{mediaId} {
  allow read: if true;
  allow create, update, delete: if signedIn() && request.auth.token.email.lower() == "ubaidji07@gmail.com";
}`}
              </pre>
              <button
                type="button"
                onClick={copyFirestoreRules}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium rounded flex items-center gap-1"
              >
                {copiedRules ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Rule</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              Even without modifying existing rules, your product photos save directly inside your product documents under your existing product admin permissions!
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-[#234737] text-white text-xs font-semibold rounded-md hover:bg-[#1A3529]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
