import type { ProductsRepository } from "../domain/products.repository.js";
import type { ProductLabel } from "../domain/product.entity.js";
import AppError from "@shared/errors/AppError.js";

export class GetProductLabelUseCase {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async execute(productId: string): Promise<ProductLabel> {
        const product = await this.productsRepository.findById(productId);
        if (!product) {
            throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404);
        }

        const printableHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Etiqueta - ${product.name}</title>
  <style>
    @page { size: 60mm 40mm; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 4mm; color: #000; }
    .label-box { border: 1px dashed #666; padding: 3mm; border-radius: 4px; text-align: center; }
    .title { font-size: 11pt; font-weight: bold; margin-bottom: 2mm; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .meta { font-size: 8pt; color: #444; margin-bottom: 2mm; }
    .code { font-family: monospace; font-size: 10pt; font-weight: bold; letter-spacing: 1.5px; margin-top: 1mm; }
    .note { font-size: 6pt; color: #888; margin-top: 2mm; }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="title">${product.name}</div>
    <div class="meta">${product.categoryName ? 'Cat: ' + product.categoryName : ''}</div>
    <div class="code">${product.code}</div>
    <div class="note">Code 128 / QR • Control de Inventario</div>
  </div>
</body>
</html>`;

        return {
            productId: product.id,
            name: product.name,
            code: product.code,
            categoryName: product.categoryName,
            barcode: {
                format: "CODE128",
                value: product.code,
            },
            qr: {
                format: "QR",
                value: product.code,
                note: "El código identifica al producto; las existencias se consultan en la base de datos. La cantidad disponible no debe guardarse dentro del QR.",
            },
            printableHtml,
        };
    }
}
