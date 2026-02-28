import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Loader2, PenTool, Plus, X, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/types";
import { verificationQueries } from "@/hooks/use-verification";

export const Route = createFileRoute("/extract/")({
  component: Index,
});

const formSchema = z.object({
  documentName: z.string(),
  documentFile: z.instanceof(File, {
    message: "Document file is required",
  }),
});

function Index() {
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      documentName: "",
      documentFile: null as unknown as File,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.documentFile) return;

      const formData = new FormData();
      const finalName = value.documentName.trim() || value.documentFile.name;

      formData.append("document_name", finalName);
      formData.append("document_file", value.documentFile);

      const toastId = toast.loading("Extracting signatures...");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_N8N_BASE_URL}/signatures/extract`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (res.ok) {
          const data: ApiResponse<{ verificationId: string }> =
            await res.json();
          toast.success("Signatures extracted successfully!", { id: toastId });
          queryClient.invalidateQueries(verificationQueries.getAll());
          navigate({
            to: "/verifications/$id",
            params: { id: data.data.verificationId },
          });
        } else {
          toast.error("Failed to extract signatures. Please try again.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("An error occurred during extraction.", { id: toastId });
      }
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        form.setFieldValue("documentFile", selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    },
    [form],
  );

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !!preview,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
  });

  const handleCancel = () => {
    setPreview(null);
    form.reset();
  };

  return (
    <div className="h-full" {...getRootProps()}>
      {!preview ? (
        <>
          <input {...getInputProps()} />
          <Empty
            className={`border border-dashed h-full transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : ""
            }`}
          >
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="text-primary" />
              </EmptyMedia>
              <EmptyTitle>
                {isDragActive ? "Drop Document" : "Extract Signatures"}
              </EmptyTitle>
              <EmptyDescription>
                Upload a signed document to automatically detect and extract
                handwritten signatures for analysis.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </EmptyContent>
          </Empty>
        </>
      ) : (
        <form
          id="extract-signature-form"
          className="flex items-center justify-center h-full gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div
            className="w-lg flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <FieldGroup>
              <form.Field
                name="documentName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Document Name{" "}
                        <span className="text-muted-foreground font-normal">
                          (Optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        placeholder={
                          form.state.values.documentFile?.name ||
                          "e.g., Service Agreement"
                        }
                      />
                      <FieldDescription>
                        If left blank, the original file name will be used.
                      </FieldDescription>
                    </Field>
                  );
                }}
              />
              <Separator />
              <form.Field
                name="documentFile"
                children={(field) => {
                  const file = field.state.value;
                  const isPDF = file?.type === "application/pdf";
                  const isImage = file?.type.startsWith("image/");

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Source Document
                      </FieldLabel>
                      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-input bg-background shadow-sm">
                        <div className="relative flex h-96 w-full items-center justify-center bg-muted/30 p-4">
                          {preview && isImage ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="h-full w-full object-contain p-4"
                            />
                          ) : preview && isPDF ? (
                            <iframe
                              src={`${preview}#toolbar=0&navpanes=0`}
                              className="h-full w-full rounded-xl border-none"
                              title="PDF Preview"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">
                                {file?.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Field>
                  );
                }}
              />
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={handleCancel}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      ) : (
                        <PenTool className="mr-2 h-4 w-4" />
                      )}
                      {isSubmitting ? "Extracting..." : "Extract Signature"}
                    </Button>
                  )}
                />
              </div>
            </FieldGroup>
          </div>
        </form>
      )}
    </div>
  );
}
