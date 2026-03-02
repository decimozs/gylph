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

export type DocumentFinalRankType = "low" | "moderate" | "high";
export type DocumentSuspicionType =
  | "medical-jargon"
  | "untrained-writing"
  | "billing-anomaly"
  | "protocol-deviation"
  | "none";
export type DocumentStatus =
  | "pending"
  | "processing"
  | "flagged"
  | "clear"
  | "reviewed";

export interface Document {
  id: string;
  signatureId: string;
  verificationId: string;
  no: string;
  markdown: string | null;
  text: string | null;
  url: string;
  textExtractionImageUrl: string | null;
  signatureExtractionImageUrl: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
  medicalLanguageScore: number;
  protocolScore: number;
  linguisticScore: number;
  severityScore: number;
  finalRank: DocumentFinalRankType;
  suspicionType: DocumentSuspicionType;
  analysisSummary: string | null;
  languageNote: string | null;
  protocolNote: string | null;
  linguisticNote: string | null;
  overview: string;
}

export type VerificationStatus = "authentic" | "forged" | "needs-review";
