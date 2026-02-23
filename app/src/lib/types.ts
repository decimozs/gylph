export interface Signature {
  id: string;
  name: string;
  imageUrl: string;
  previewImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type SignatureType = "vis" | "roi" | "normalized";

export interface SignatureLogs {
  id: string;
  signatureId: string;
  type: SignatureType;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Verification {
  id: string;
  signatureId: string;
  queryImageUrl: string;
  isAuthentic: boolean;
  similarityScore: number;
  previewImageUrl: string;
  createdAt: string;
  updatedAt: string;
  previewLiveNormalizedImageUrl: string;
  previewRefNormalizedImageUrl: string;
}
