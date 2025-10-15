'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/animate-ui/components/buttons/button"
import { Checkbox } from "@/components/animate-ui/components/base/checkbox"
import Link from "next/link"
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import authService from "@/service/AuthService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// ESQUEMA DE VALIDACIÓN MEJORADO - Coherente con RegisterUserDTO.java del backend
const registerSchema = z.object({
  idNumber: z.string()
    .min(2, { message: "ID number must be at least 2 characters." })
    .max(15, { message: "ID number must not exceed 15 characters." })
    .regex(/^[0-9A-Za-z-]+$/, { message: "ID number must contain only letters, numbers, and hyphens." }),

  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must not exceed 50 characters." })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: "Name must contain only letters and spaces." }),

  lastName: z.string()
    .min(2, { message: "Last name must be at least 2 characters." })
    .max(50, { message: "Last name must not exceed 50 characters." })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: "Last name must contain only letters and spaces." }),

  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email must not exceed 100 characters." }),

  phoneNumber: z.string()
    .regex(/^[+]?[0-9]{10,15}$/, { message: "Phone number must be 10-15 digits, optionally starting with +." })
    .optional()
    .or(z.literal("")),

  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password must not exceed 100 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[@#$%^&+=!]/, { message: "Password must contain at least one special character (@#$%^&+=!)." }),

  confirmPassword: z.string(),

  dateOfBirth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true; // Opcional
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, { message: "Date of birth must be in the past." })
    .refine((date) => {
      if (!date) return true; // Opcional
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13;
    }, { message: "You must be at least 13 years old." }),

  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      idNumber: "",
      name: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      termsAccepted: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const result = await authService.register({
        idNumber: data.idNumber,
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        termsAccepted: data.termsAccepted,
      })

      // Mostrar Alert de éxito
      setSuccessMessage(result.message || 'Please check your email to activate your account.')
      setShowSuccessAlert(true)

      // Toast de éxito con Sonner
      toast.success('Account created successfully!', {
        description: result.message || 'Please check your email to activate your account.',
      })

      // Resetear el formulario
      form.reset()

      // Redirigir después de 3 segundos para que el usuario vea el alert
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error: any) {
      // Toast de error con Sonner
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred'
      toast.error('Failed to create account', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <ThemeTogglerButton />
          </div>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alert de éxito */}
          {showSuccessAlert && (
            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">
                Account created successfully!
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* ID NUMBER */}
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NOMBRE */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* APELLIDO */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHONE NUMBER */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DATE OF BIRTH */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CONTRASEÑA */}
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
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must be 8-100 characters with uppercase, lowercase, number, and special character (@#$%^&+=!)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CONFIRMAR CONTRASEÑA */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
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

              {/* TÉRMINOS Y CONDICIONES */}
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                          terms and conditions
                        </Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                          privacy policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* BOTÓN DE ENVÍO */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}