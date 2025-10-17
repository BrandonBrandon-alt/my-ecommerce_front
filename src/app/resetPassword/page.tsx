'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import authService from "@/service/AuthService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/animate-ui/components/buttons/button"
import Link from "next/link"
import { toast } from "sonner"
/**
 * Schema de validación para el formulario de activate account
 */
const activateAccountSchema = z.object({
    resetCode: z.string().min(6, "Code must be at least 6 characters long").
        max(6, "Code must be at most 6 characters long").
        regex(/^[0-9]+$/, "Code must be a number"),
    password: z.string().min(8, "Password must be at least 8 characters long").
        max(100, "Password must be at most 100 characters long").
        regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/, "Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long").
        max(100, "Confirm Password must be at most 100 characters long").
        regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/, "Confirm Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character"),


})

/**
 * Tipo de datos para el formulario de activate account
 */
type ActivateAccountFormData = z.infer<typeof activateAccountSchema>


export default function ResetPassword() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessAlert, setShowSuccessAlert] = useState(false)
    const [showErrorAlert, setShowErrorAlert] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const searchParams = useSearchParams()
    const [showPassword, setShowPassword] = useState(false)
    const email = searchParams.get('email') || ''

    /**
 * Formulario de activate account
 */
    const form = useForm<ActivateAccountFormData>({
        resolver: zodResolver(activateAccountSchema),
        defaultValues: {
            resetCode: "",
            password: "",
            confirmPassword: "",
        },
    })

    /**
     * Manejo del envío del formulario de reset password
     */

    const onSubmit = async (data: ActivateAccountFormData) => {
        setIsLoading(true)
        try {
            const result = await authService.resetPassword({
                resetCode: data.resetCode,
                password: data.password,
                confirmPassword: data.confirmPassword,
            })

            // Mostrar Alert de éxito
            setSuccessMessage(result.message || 'Account activated successfully!')
            setShowSuccessAlert(true)

            form.reset()

            setTimeout(() => {
                router.push('/login')
            }, 1500)

        } catch (error: any) {
            // Obtener mensaje de error
            const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred'

            // Mostrar Alert de error
            setErrorMessage(errorMsg)
            setShowErrorAlert(true)

            setTimeout(() => {
                setShowErrorAlert(false)
            }, 3000)

        } finally {
            setIsLoading(false)
        }
    }

    // Cooldown para evitar spam
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleResendCode = async () => {
        if (!email) {
            toast.error("Email not found. Please restart the password reset process.");
            router.push('/forgotPassword')
            return;
        }

        try {
            await authService.resendResetCode({ email });
            setCanResend(false);
            setCountdown(60);
            toast.success("Code sent to " + email);
        } catch (error) {
            toast.error("Failed to send code");
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Alert de éxito */}
                    {showSuccessAlert && (
                        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">
                                Activate Account Success!
                            </AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Alert de error */}
                    {showErrorAlert && (
                        <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertTitle className="text-red-800 dark:text-red-300">
                                Failed to activate account
                            </AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-red-400">
                                {errorMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Formulario de activate account */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
                            {/* ACTIVATION CODE */}
                            <FormField
                                control={form.control}
                                name="resetCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reset Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter reset code" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the reset code sent to your email
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    disabled={isLoading}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-6 w-6" />
                                                    ) : (
                                                        <Eye className="h-6 w-6" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Your password
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    disabled={isLoading}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-6 w-6" />
                                                    ) : (
                                                        <Eye className="h-6 w-6" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Enter the confirm password
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Botón de envío */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Didn't receive the code?{" "}
                        <Button
                            variant="link"
                            onClick={handleResendCode}
                            disabled={!canResend || isLoading}
                            className="p-0 h-auto"
                        >
                            {canResend ? "Resend code" : `Resend in ${countdown}s`}
                        </Button>
                    </div>


                </CardContent>
            </Card>
        </div>
    )



}




