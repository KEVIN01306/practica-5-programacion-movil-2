export interface Category {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategory {
    name: string;
    description?: string | null;
}

export interface UpdateCategory {
    name?: string;
    description?: string | null;
}
