import type { ProductsRepository } from "../domain/products.repository.js";
import crypto from "crypto";

export class GenerateProductCodeUseCase {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async execute(prefix: string = "PRD"): Promise<string> {
        const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Base32 unambiguous
        let code = "";
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 20) {
            attempts++;
            const randomBytes = crypto.randomBytes(4);
            let suffix = "";
            for (let i = 0; i < 6; i++) {
                const byte = randomBytes[i % randomBytes.length] ?? 0;
                suffix += chars[byte % chars.length];
            }
            code = `${prefix.toUpperCase()}-${suffix}`;

            const existing = await this.productsRepository.findByCode(code);
            if (!existing) {
                isUnique = true;
            }
        }

        return code;
    }
}
