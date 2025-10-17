// hooks/useApiErrorHandler.ts
import { UseFormReturn } from 'react-hook-form';
import { AxiosError } from 'axios';

// 📝 Estructura del error del backend
interface BackendErrorResponse {
    message?: string;
    errors?: Record<string, string>;
    timestamp?: string;
    status?: number;
}

// 🎯 Mensajes de error por código de estado
const ERROR_MESSAGES = {
    400: 'Please check the entered data.',
    401: 'Incorrect email or password.',
    403: 'Your account is not activated.',
    423: 'Your account is temporarily locked. Please try again later.',
    500: 'A server error occurred. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
    default: 'An unexpected error occurred'
} as const;

// 🔧 Helper: Marcar errores en campos del formulario
const handleValidationErrors = (
    errors: Record<string, string>,
    form: UseFormReturn<any>
) => {
    Object.entries(errors).forEach(([field, msg]) => {
        form.setError(field, {
            type: 'server',
            message: String(msg)
        });
    });
};

// 🔧 Helper: Obtener mensaje de error apropiado
const getErrorMessage = (status: number, message?: string): string => {
    // Mensajes personalizados del backend
    if (status === 401 && message) {
        const lowerMsg = message.toLowerCase();
        // Mensajes específicos de cuenta bloqueada
        if (lowerMsg.includes('bloqueada') ||
            lowerMsg.includes('intenta nuevamente') ||
            lowerMsg.includes('locked')) {
            return message;
        }
    }

    // Usar mensaje del backend si existe para ciertos códigos
    if ((status === 403 || status === 423) && message) {
        return message;
    }

    // Mensajes por defecto según status
    return ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] ||
        message ||
        ERROR_MESSAGES.default;
};

// 🎣 HOOK PRINCIPAL ADAPTADO PARA AXIOS
export const useApiErrorHandler = () => {
    return (error: unknown, form?: UseFormReturn<any>): string => {
        // Verificar si es un error de Axios
        if (error instanceof AxiosError) {
            const status = error.response?.status || 500;
            const data = error.response?.data as BackendErrorResponse;

            const message = data?.message;
            const errors = data?.errors;

            // PASO 1: Si es error 400 con validaciones, marcar campos
            if (status === 400 && errors && form) {
                handleValidationErrors(errors, form);
            }

            // PASO 2: Retornar mensaje apropiado
            return getErrorMessage(status, message);
        }

        // Si no es error de Axios (error de red, timeout, etc.)
        if (error instanceof Error) {
            return error.message || ERROR_MESSAGES.default;
        }

        // Fallback para errores desconocidos
        return ERROR_MESSAGES.default;
    };
};