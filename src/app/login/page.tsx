'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import * as z from "zod"
import authService from "@/service/AuthService"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/animate-ui/components/buttons/button"
import { useAnimatedAlert } from '@/hooks/useAnimatedAlert'
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler'

/**
 * Schema de validación para el formulario de login
 */
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
})

/**
 * Tipo de datos para el formulario de login
 */
type LoginFormData = z.infer<typeof loginSchema>

/**
 * Constantes
 */
const TIMEOUTS = {
  successAlert: 1500,
  navigation: 300,
  errorAlert: 5000
} as const

/**
 * Componente de login
 */
export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const successAlert = useAnimatedAlert()
  const errorAlert = useAnimatedAlert()

  // 🎣 Hook para manejar errores
  const handleError = useApiErrorHandler()

  /**
   * Formulario de login
   */
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**
   * Manejo del envío del formulario de login
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await authService.login({
        email: data.email,
        password: data.password,
      })

      // ✅ Éxito
      successAlert.show(result.message || 'Login successful!')
      form.reset()

      // Navegación con delay
      setTimeout(() => {
        successAlert.hide()
        setTimeout(() => router.push('/home'), TIMEOUTS.navigation)
      }, TIMEOUTS.successAlert)

    } catch (error) {
      // 🎣 Usar el hook para manejar todos los errores
      // El hook automáticamente:
      // 1. Extrae status, message, errors del AxiosError
      // 2. Marca campos del form si hay errores 400
      // 3. Retorna el mensaje apropiado
      const errorMessage = handleError(error, form)

      errorAlert.show(errorMessage)
      setTimeout(() => errorAlert.hide(), TIMEOUTS.errorAlert)

    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Renderizado del componente
   */
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center items-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Alert de éxito con animación */}
          {successAlert.isVisible && (
            <Alert
              isExiting={successAlert.isExiting}
              className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">
                Login successful!
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                {successAlert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Alert de error con animación */}
          {errorAlert.isVisible && (
            <Alert
              isExiting={errorAlert.isExiting}
              className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/20"
            >
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">
                Failed to login
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                {errorAlert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulario de login */}
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
                      Your email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                          className="pr-10"
                          autoComplete="current-password"
                        />
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

              {/* Link de recuperación de contraseña */}
              <div className="mt-4 text-sm">
                Forgot Password?{" "}
                <Link href="/forgotPassword" className="text-primary underline-offset-4 hover:underline">
                  Reset Password
                </Link>
              </div>

              {/* Botón de envío */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          {/* Link de registro */}
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}