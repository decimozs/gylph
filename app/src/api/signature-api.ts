import { apiClient } from "@/lib/api-client";
import type {
  Document,
  Signature,
  SignatureLogs,
  Verification,
} from "@/lib/types";

export const getAllSignatures = async () => {
  return await apiClient<Signature[]>("/signatures", { method: "GET" });
};

export const getSignatureById = async (id: string) => {
  return await apiClient<
    Signature & {
      logs: SignatureLogs[];
      verifications: Verification[];
      documents: Document[];
    }
  >(`/signatures/${id}`, { method: "GET" });
};
