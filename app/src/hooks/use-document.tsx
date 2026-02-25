import { getAllDocuments, getDocumentById } from "@/api/document-api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const documentQueries = {
  getAll: () =>
    queryOptions({
      queryKey: ["documents"],
      queryFn: getAllDocuments,
    }),
  getById: (id: string) =>
    queryOptions({
      enabled: !!id,
      queryKey: ["document", id],
      queryFn: () => getDocumentById(id),
    }),
};

export const useGetAllDocuments = () => {
  return useQuery(documentQueries.getAll());
};

export const useGetDocumentById = (id: string) => {
  return useQuery(documentQueries.getById(id));
};
