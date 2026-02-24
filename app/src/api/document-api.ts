import { apiClient } from "@/lib/api-client";
import type { Document, Signature, Verification } from "@/lib/types";

export const getAllDocuments = async () => {
  return await apiClient<Document[]>("/documents", { method: "GET" });
};

export const getDocumentById = async (id: string) => {
  return await apiClient<
    Document & { signatures: Signature; verifications: Verification }
  >(`/documents/${id}`, { method: "GET" });
};
