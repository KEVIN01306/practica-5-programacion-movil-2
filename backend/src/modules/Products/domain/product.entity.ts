export interface Product {
    id: string;
    code: string;
    name: string;
    description: string | null;
    costPrice: number;
    salePrice: number;
    currentStock: number;
    minStock: number;
    imageUrl: string | null;
    isActive: boolean;
    categoryId: string;
    categoryName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProduct {
    code: string;
    name: string;
    description?: string | null;
    costPrice: number;
    salePrice: number;
    currentStock?: number;
    minStock?: number;
    imageUrl?: string | null;
    categoryId: string;
}

export interface UpdateProduct {
    code?: string;
    name?: string;
    description?: string | null;
    costPrice?: number;
    salePrice?: number;
    minStock?: number;
    imageUrl?: string | null;
    categoryId?: string;
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    lowStock?: boolean;
}

export interface ProductLabel {
    productId: string;
    name: string;
    code: string;
    categoryName?: string;
    barcode: {
        format: "CODE128";
        value: string;
    };
    qr: {
        format: "QR";
        value: string;
        note: string;
    };
    printableHtml: string;
}
