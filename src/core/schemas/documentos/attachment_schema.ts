import { z } from "zod";

export const attachmentEntityTypeSchema = z.enum([
  "OBRA",
  "OBRA_PRIVADA",
  "CONTRATO",
  "MEDICAO",
  "DOCUMENTO",
  "OUTRO",
]);
export type AttachmentEntityType = z.infer<typeof attachmentEntityTypeSchema>;

export const attachmentSchema = z
  .object({
    id: z.string(),
    fileUrl: z.string(),
    originalName: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    createdAt: z.unknown().optional(),
    updatedAt: z.unknown().optional(),
  })
  .passthrough();
export type Attachment = z.infer<typeof attachmentSchema>;
