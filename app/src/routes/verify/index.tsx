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
import {
  CircleCheck,
  Loader2,
  ScanSearch,
  CheckCircle2,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/types";
import { verificationQueries } from "@/hooks/use-verification";

export const Route = createFileRoute("/verify/")({
  component: Index,
});

const verifySchema = z.object({
  signatureImage: z.any().refine((file) => file instanceof File, {
    message: "Test signature image is required",
  }),
});

function Index() {
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      signatureImage: null as File | null,
    },
    validators: {
      onChange: verifySchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.signatureImage) return;

      const formData = new FormData();
      formData.append("signature_image", value.signatureImage);

      const toastId = toast.loading("Verifying signature authenticity...");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_N8N_BASE_URL}/signatures/verify`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (res.ok) {
          const data: ApiResponse<{
            verificationId: string;
            isAuthentic: boolean;
            similarityScore: number;
          }> = await res.json();
          toast.success("Verification complete!", { id: toastId });
          queryClient.invalidateQueries(verificationQueries.getAll());
          navigate({
            to: "/verifications/$id",
            params: { id: data.data.verificationId },
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(
            errData.message || "Verification failed. Signature mismatch.",
            { id: toastId },
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("An error occurred during the verification process.", {
          id: toastId,
        });
      }
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        form.setFieldValue("signatureImage", selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    },
    [form],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !!preview,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
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
                <ScanSearch className="text-primary" />
              </EmptyMedia>
              <EmptyTitle>
                {isDragActive ? "Drop to Scan" : "Perform Verification"}
              </EmptyTitle>
              <EmptyDescription>
                Upload a document or signature extract to compare against the
                registered biometric baseline in our database.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="lg">
                <CircleCheck className="mr-2 h-4 w-4" />
                Select Signature to Verify
              </Button>
            </EmptyContent>
          </Empty>
        </>
      ) : (
        <form
          id="verify-signature-form"
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
                name="signatureImage"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Test Signature Image
                      </FieldLabel>
                      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-input bg-background shadow-sm">
                        <div className="relative flex h-48 w-full items-center justify-center bg-white">
                          <img
                            src={preview}
                            alt="Verification Preview"
                            className="h-full w-full object-contain p-4"
                          />
                        </div>
                      </div>
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : (
                        <FieldDescription>
                          Image to be authenticated against the system record.
                        </FieldDescription>
                      )}
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
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {isSubmitting ? "Verifying..." : "Run Verification"}
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
