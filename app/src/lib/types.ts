export interface Signature {
  id: string;
  no: string;
  name: string;
  imageUrl: string;
  email: string;
  previewImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type SignatureType = "vis" | "roi" | "normalized";

export interface SignatureLogs {
  id: string;
  no: string;
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
  no: string;
  isAuthentic: boolean;
  similarityScore: number;
  previewImageUrl: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  previewLiveNormalizedImageUrl: string;
  previewRefNormalizedImageUrl: string;
}

export interface Document {
  id: string;
  signatureId: string;
  verificationId: string;
  no: string;
  markdown: string;
  url: string;
  previewImageUrl: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export type VerificationStatus = "authentic" | "forged" | "needs-review";
