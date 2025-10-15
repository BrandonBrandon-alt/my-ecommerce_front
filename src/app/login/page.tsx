'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import * as z from "zod"
import authService from "@/service/AuthService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/animate-ui/components/buttons/button"
import Link from "next/link"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'

/**
 * Schema de validación para el formulario de login
 */
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password must not exceed 100 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[@#$%^&+=!]/, { message: "Password must contain at least one special character (@#$%^&+=!)." }),
})

/**
 * Tipo de datos para el formulario de login
 */
type LoginFormData = z.infer<typeof loginSchema>

/**
 * Componente de login
 */
export default function Login() {

  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const isGoogleConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

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
   * Manejo del éxito de la autenticación con Google
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsGoogleLoading(true)
    setShowErrorAlert(false)

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google')
      }

      const result = await authService.loginWithGoogle({
        idToken: credentialResponse.credential,
      })

      // Validar que se recibió el token de acceso
      if (!result.access_token) {
        throw new Error('No se recibió token de autenticación')
      }

      // Mensaje de éxito del backend o mensaje por defecto
      const successMsg = result.message || 'Google login successful! Redirecting...'
      const userName = result.user_info?.name || result.user_info?.email || 'User'

      // Mostrar Alert de éxito
      setSuccessMessage(successMsg)
      setShowSuccessAlert(true)

      // Redirigir al dashboard o home
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Google login failed'

      // Mostrar Alert de error
      setErrorMessage(errorMsg)
      setShowErrorAlert(true)

      // Ocultar el alert de error después de 5 segundos
      setTimeout(() => {
        setShowErrorAlert(false)
      }, 1500)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  /**
   * Manejo del error de la autenticación con Google
   */
  const handleGoogleError = () => {
    setErrorMessage('An error occurred during Google authentication.')
    setShowErrorAlert(true)

    setTimeout(() => {
      setShowErrorAlert(false)
    }, 1500)
  }

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

      // Mostrar Alert de éxito
      setSuccessMessage(result.message || 'Login successful!')
      setShowSuccessAlert(true)

      form.reset()

      setTimeout(() => {
        router.push('/home')
      }, 3000)

    } catch (error: any) {
      // Obtener mensaje de error
      const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred'

      // Mostrar Alert de error
      setErrorMessage(errorMsg)
      setShowErrorAlert(true)


      setTimeout(() => {
        setShowErrorAlert(false)
      }, 1500)

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

          {/* Alert de éxito */}
          {showSuccessAlert && (
            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">
                Login successful!
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Alert de error */}
          {showErrorAlert && (
            <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/20 animate-in fade-in-50 slide-in-from-top-5 duration-300">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">
                Failed to login
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                {errorMessage}
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
                      <Input placeholder="name@example.com" {...field} disabled={isLoading || isGoogleLoading} />
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
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading || isGoogleLoading} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          disabled={isLoading || isGoogleLoading}
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

              {/* Botón de envío */}
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading || isGoogleLoading ? (
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

          {/* Divider y Google Login - Solo si está configurado */}
          {isGoogleConfigured && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
            </>
          )}

          {/* Link de registro */}
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Register
            </Link >
          </div>
        </CardContent>
      </Card>
    </div>
  )

}
