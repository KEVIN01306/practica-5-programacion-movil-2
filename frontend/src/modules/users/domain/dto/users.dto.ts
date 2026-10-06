export interface RoleDto {
    id: string;
    name: string;
    description?: string | null;
}

export interface UserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roles?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUserDto {
    email: string;
    passwordRaw?: string;
    autoGeneratePassword?: boolean;
    firstName: string;
    lastName: string;
    roles: string[];
}

export interface UpdateUserDto {
    email?: string;
    passwordRaw?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
}
