'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import authService from "@/service/AuthService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/animate-ui/components/buttons/button"

/**
 * Schema de validación para el formulario de forgot password
 */
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

/**
 * Tipo de datos para el formulario de forgot password
 */
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessAlert, setShowSuccessAlert] = useState(false)
    const [showErrorAlert, setShowErrorAlert] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    /**
     * Formulario de forgot password
     */
    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    /**
     * Manejo del envío del formulario de forgot password
     */
    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        try {
            const result = await authService.forgotPassword({
                email: data.email,
            })

            // Mostrar Alert de éxito
            setSuccessMessage(result.message || 'Password reset email sent successfully!')
            setShowSuccessAlert(true)

            form.reset()

            setTimeout(() => {
                router.push('/activateAccount')
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

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Alert de éxito */}
                    {showSuccessAlert && (
                        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">
                                Success!
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
                                Failed to send reset email
                            </AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-red-400">
                                {errorMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Formulario de forgot password */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
                            {/* EMAIL */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter your email address to receive a password reset link
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
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}