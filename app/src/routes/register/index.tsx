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
import { Loader2, PenTool, Plus, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { signatureQueries } from "@/hooks/use-signature";
import type { ApiResponse } from "@/lib/types";

export const Route = createFileRoute("/register/")({
  component: Index,
});

const formSchema = z.object({
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatureImage: z.any().refine((file) => file instanceof File, {
    message: "Signature image is required",
  }),
});

function Index() {
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      signatoryName: "",
      signatureImage: null as File | null,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.signatureImage || !value.signatoryName) return;

      const formData = new FormData();
      formData.append("signatory_name", value.signatoryName);
      formData.append("signature_image", value.signatureImage);

      const toastId = toast.loading("Processing signature...");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_N8N_BASE_URL}/signatures/register`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (res.ok) {
          const data: ApiResponse<{ signatureId: string }> = await res.json();
          toast.success("Signature registered successfully!", { id: toastId });
          queryClient.invalidateQueries(signatureQueries.getAll());
          navigate({
            to: "/signatures/$id",
            params: { id: data.data.signatureId },
          });
        } else {
          toast.error("Failed to register signature. Please try again.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("An error occurred during registration.", { id: toastId });
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
                <PenTool className="text-primary" />
              </EmptyMedia>
              <EmptyTitle>
                {isDragActive ? "Drop to Register" : "Register Signature"}
              </EmptyTitle>
              <EmptyDescription>
                Register a baseline signature to start verifying documents and
                authenticating identities.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Register New Signature
              </Button>
            </EmptyContent>
          </Empty>
        </>
      ) : (
        <form
          id="register-signature-form"
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
                name="signatoryName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Full Legal Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        placeholder="e.g., John Doe"
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : (
                        <FieldDescription>
                          Provide the official name associated with this
                          signature baseline.
                        </FieldDescription>
                      )}
                    </Field>
                  );
                }}
              />

              <Separator />

              <form.Field
                name="signatureImage"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Signature Baseline
                      </FieldLabel>
                      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-input bg-background shadow-sm">
                        <div className="relative flex h-48 w-full items-center justify-center bg-white">
                          <img
                            src={preview}
                            alt="Signature Preview"
                            className="h-full w-full object-contain p-4"
                          />
                        </div>
                      </div>
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : (
                        <FieldDescription>
                          High-resolution reference image for biometric
                          verification.
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
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      {isSubmitting ? "Registering..." : "Register"}
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
