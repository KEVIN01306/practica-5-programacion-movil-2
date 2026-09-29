import AppError from "@shared/errors/AppError.js";
import type { AuthRepository } from "../domain/auth.repository.js";

interface GetProfileResponse {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    createdAt?: Date;
}

export class GetProfileUseCase {
    constructor(
        private readonly authRepository: AuthRepository
    ) { }

    async execute(userId: string): Promise<GetProfileResponse> {
        const user = await this.authRepository.findById(userId)
        
        if (!user) {
            throw new AppError("User not found", "NOT_FOUND", 404)
        }
        
        return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
            isActive: user.isActive,
            createdAt: user.createdAt,
        }
    }
}

