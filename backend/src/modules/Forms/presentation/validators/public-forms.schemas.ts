import { z } from "zod";

export const PublicFormSubmitParamsSchema = z.object({
    slug: z.string().trim().min(1, "Form slug is required"),
});
