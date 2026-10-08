import { z } from "zod";

const SubmissionStatusEnum = z.enum(["PENDING", "PROCESSED", "SPAM", "FAILED"]);

export const UpdateSubmissionStatusBodySchema = z.object({
    status: SubmissionStatusEnum,
});

export const FormSubmissionIdParamSchema = z.object({
    id: z.string().uuid("Invalid Form Submission ID"),
});

export const ListFormSubmissionsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    status: SubmissionStatusEnum.optional(),
    search: z.string().trim().optional(),
    formId: z.string().uuid("Invalid Form ID").optional(),
    websiteId: z.string().uuid("Invalid Website ID").optional(),
});
