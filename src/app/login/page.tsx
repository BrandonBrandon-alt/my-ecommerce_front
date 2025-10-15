'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/animate-ui/components/buttons/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"
import authService from "@/service/AuthService"

// Esquema de validación para login
const loginSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email must not exceed 100 characters." }),
  password: z.string()
    .min(1, { message: "Password is required." }),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setShowErrorAlert(false)

    try {
      const result = await authService.login({
        email: data.email,
        password: data.password,
      })

      // Mostrar Alert de éxito
      setSuccessMessage('Login successful! Redirecting...')
      setShowSuccessAlert(true)

      // Toast de éxito
      toast.success('Welcome back!', {
        description: 'You have successfully logged in.',
      })

      // Resetear el formulario
      form.reset()

      // Redirigir al dashboard o home
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred'
      
      // Mostrar Alert de error
      setErrorMessage(errorMsg)
      setShowErrorAlert(true)

      // Toast de error
      toast.error('Login failed', {
        description: errorMsg,
      })

      // Ocultar el alert de error después de 5 segundos
      setTimeout(() => {
        setShowErrorAlert(false)
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

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

      // Mostrar Alert de éxito
      setSuccessMessage('Google login successful! Redirecting...')
      setShowSuccessAlert(true)

      // Toast de éxito
      toast.success('Welcome!', {
        description: 'You have successfully logged in with Google.',
      })

      // Redirigir al dashboard o home
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Google login failed'
      
      // Mostrar Alert de error
      setErrorMessage(errorMsg)
      setShowErrorAlert(true)

      // Toast de error
      toast.error('Google login failed', {
        description: errorMsg,
      })

      // Ocultar el alert de error después de 5 segundos
      setTimeout(() => {
        setShowErrorAlert(false)
      }, 5000)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    toast.error('Google login failed', {
      description: 'An error occurred during Google authentication.',
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center items-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
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
            <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/20 animate-in fade-in-50 slide-in-from-top-5 duration-300">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">
                Login failed
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={isLoading || isGoogleLoading}
                      />
                    </FormControl>
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
                          disabled={isLoading || isGoogleLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          disabled={isLoading || isGoogleLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* BOTÓN DE LOGIN */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isGoogleLoading}
              >
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
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

          {/* Register Link */}
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
