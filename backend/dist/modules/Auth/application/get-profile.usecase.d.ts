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
export declare class GetProfileUseCase {
    private readonly authRepository;
    constructor(authRepository: AuthRepository);
    execute(userId: string): Promise<GetProfileResponse>;
}
export {};
//# sourceMappingURL=get-profile.usecase.d.ts.map