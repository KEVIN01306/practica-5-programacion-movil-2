export interface User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isVerify: boolean;
    roles?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUser extends Omit<User, 'id' | 'isActive' | 'isVerify' | 'createdAt' | 'updatedAt'> {
    roles?: string[];
    isVerify?: boolean;
}
export interface UpdateUser extends Partial<Omit<User, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>> {
    roles?: string[];
}
export interface GetUser extends Omit<User, 'passwordHash'> {
    roles: string[];
    emailSent?: boolean;
    generatedPassword?: string;
}
export interface GetSimpleUser extends Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'isActive' | 'isVerify'> {
    roles: string[];
}
//# sourceMappingURL=user.entity.d.ts.map