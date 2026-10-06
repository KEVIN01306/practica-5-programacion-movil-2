import AppError from "../../../shared/errors/AppError.js";
export class HttpOtpProvider {
    baseUrl;
    apiKey;
    constructor(baseUrl, apiKey) {
        this.baseUrl = (baseUrl || process.env.OTP_URL || "http://localhost:8000/api/v1/").replace(/\/+$/, "");
        this.apiKey = apiKey || process.env.OTP_PROVIDER || "";
        if (!this.apiKey) {
            console.warn("[HttpOtpProvider] Warning: OTP_PROVIDER API key is not configured in environment variables.");
        }
    }
    async sendOtp(email, type = 'PASSWORD_RESET') {
        try {
            const url = `${this.baseUrl}/otp/send`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                },
                body: JSON.stringify({ email, type }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                const message = data.error || data.message || "No se pudo enviar el código OTP";
                if (response.status === 429) {
                    throw new AppError(message, "OTP_RATE_LIMITED", 429);
                }
                if (response.status === 401 || response.status === 403) {
                    throw new AppError("Error de autenticación con el servicio de OTP", "OTP_SERVICE_AUTH_ERROR", 500);
                }
                throw new AppError(message, "OTP_SEND_FAILED", response.status || 400);
            }
            return {
                success: true,
                message: data.message || "Código OTP enviado correctamente",
                expiresAt: data.expiresAt,
            };
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            throw new AppError(error?.message || "Error al comunicarse con el servicio de OTP", "OTP_SERVICE_UNAVAILABLE", 503);
        }
    }
    async verifyOtp(email, code, type = 'PASSWORD_RESET') {
        try {
            const url = `${this.baseUrl}/otp/verify`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                },
                body: JSON.stringify({ email, code, type }),
            });
            const data = await response.json();
            if (!response.ok || !data.success || !data.verified) {
                const message = data.error || data.message || "Código incorrecto o inválido";
                throw new AppError(message, "INVALID_OTP", response.status === 429 ? 429 : 400);
            }
            return {
                success: true,
                verified: true,
                message: data.message || "Código verificado con éxito",
            };
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            throw new AppError(error?.message || "Error al validar el código con el servicio de OTP", "OTP_SERVICE_UNAVAILABLE", 503);
        }
    }
}
//# sourceMappingURL=http-otp.provider.js.map