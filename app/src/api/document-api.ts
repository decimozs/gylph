import { apiClient } from "@/lib/api-client";
import type {
  Document,
  OverallScore,
  Signature,
  Verification,
} from "@/lib/types";

export const getAllDocuments = async () => {
  return await apiClient<
    (Document & { verification: Verification; overall: OverallScore })[]
  >("/documents", { method: "GET" });
};

export const getDocumentById = async (id: string) => {
  return await apiClient<
    Document & {
      signature: Signature;
      verification: Verification;
      overall: OverallScore;
    }
  >(`/documents/${id}`, { method: "GET" });
};
