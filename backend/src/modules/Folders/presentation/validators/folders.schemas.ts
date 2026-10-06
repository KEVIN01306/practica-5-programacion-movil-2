import { z } from "zod";

export const CreateFolderSchema = z.object({
    name: z.string().trim().min(1, "El nombre del directorio es requerido").max(100, "Máximo 100 caracteres"),
    description: z.string().trim().max(500, "Máximo 500 caracteres").optional().nullable(),
    brandId: z.string().uuid("Formato de ID de marca inválido"),
    parentId: z.string().uuid("Formato de ID de carpeta padre inválido").optional().nullable()
});

export const UpdateFolderSchema = z.object({
    name: z.string().trim().min(1, "El nombre del directorio no puede estar vacío").max(100, "Máximo 100 caracteres").optional(),
    description: z.string().trim().max(500, "Máximo 500 caracteres").optional().nullable(),
    parentId: z.string().uuid("Formato de ID de carpeta padre inválido").optional().nullable()
});

export const FolderIdSchema = z.object({
    id: z.string().uuid("Formato de ID de directorio inválido")
});

export const CopyFolderSchema = z.object({
    targetBrandId: z.string().uuid("Formato de ID de marca destino inválido"),
    targetParentId: z.string().uuid("Formato de ID de carpeta padre inválido").optional().nullable()
});

