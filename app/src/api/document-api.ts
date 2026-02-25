import { apiClient } from "@/lib/api-client";
import type { Document, Signature, Verification } from "@/lib/types";

export const getAllDocuments = async () => {
  return await apiClient<(Document & { verifications: Verification })[]>(
    "/documents",
    { method: "GET" },
  );
};

export const getDocumentById = async (id: string) => {
  return await apiClient<
    Document & { signature: Signature; verifications: Verification }
  >(`/documents/${id}`, { method: "GET" });
};
