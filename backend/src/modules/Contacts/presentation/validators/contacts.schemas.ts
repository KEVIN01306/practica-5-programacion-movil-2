import { z } from "zod";

const ContactStatusEnum = z.enum(["LEAD", "ACTIVE", "UNSUBSCRIBED", "ARCHIVED"]);

export const CreateContactBodySchema = z.object({
    websiteId: z.string().uuid("Invalid Website ID"),
    email: z.string().trim().email("Invalid email address").max(150, "Email must not exceed 150 characters"),
    firstName: z.string().trim().max(100, "First name must not exceed 100 characters").optional().nullable(),
    lastName: z.string().trim().max(100, "Last name must not exceed 100 characters").optional().nullable(),
    phone: z.string().trim().max(50, "Phone must not exceed 50 characters").optional().nullable(),
    company: z.string().trim().max(150, "Company must not exceed 150 characters").optional().nullable(),
    status: ContactStatusEnum.optional().default("LEAD"),
    customData: z.record(z.string(), z.any()).optional().nullable(),
    tags: z.array(z.string().trim()).optional().nullable(),
});

export const UpdateContactBodySchema = z.object({
    firstName: z.string().trim().max(100, "First name must not exceed 100 characters").optional().nullable(),
    lastName: z.string().trim().max(100, "Last name must not exceed 100 characters").optional().nullable(),
    phone: z.string().trim().max(50, "Phone must not exceed 50 characters").optional().nullable(),
    company: z.string().trim().max(150, "Company must not exceed 150 characters").optional().nullable(),
    status: ContactStatusEnum.optional(),
    customData: z.record(z.string(), z.any()).optional().nullable(),
    tags: z.array(z.string().trim()).optional().nullable(),
});

export const ContactIdParamSchema = z.object({
    id: z.string().uuid("Invalid Contact ID"),
});

export const ListContactsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    websiteId: z.string().uuid("Invalid Website ID").optional(),
    status: ContactStatusEnum.optional(),
});
