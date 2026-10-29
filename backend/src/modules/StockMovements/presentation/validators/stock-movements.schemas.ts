import { z } from "zod";

export const RegisterStockMovementSchema = z.object({
    productId: z.string().uuid("Invalid product ID format"),
    type: z.enum(["ENTRY", "EXIT", "ADJUST"]),
    quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
    reason: z.string().trim().min(1, "Reason is required").max(200),
    notes: z.string().trim().max(1000).optional().nullable(),
});

export const ListStockMovementsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    productId: z.string().uuid().optional(),
    type: z.enum(["ENTRY", "EXIT", "ADJUST"]).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});
