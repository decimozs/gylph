import { apiClient } from "@/lib/api-client";
import type {
  Document,
  Signature,
  Verification,
  VerificationStatus,
} from "@/lib/types";

export const getAllVerifications = async () => {
  return await apiClient<Verification[]>("/verifications", { method: "GET" });
};

export const getVerificationById = async (id: string) => {
  return await apiClient<
    Verification & { signature: Signature; document: Document }
  >(`/verifications/${id}`, { method: "GET" });
};

export const updateVerificationStatus = async (
  id: string,
  status: VerificationStatus,
) => {
  return await apiClient<Verification>(`/verifications/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};
