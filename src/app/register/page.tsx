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
import { Button as ButtonUI } from "@/components/ui/button"
import { Checkbox } from "@/components/animate-ui/components/base/checkbox"
import Link from "next/link"
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler"
import { Eye, EyeOff, Loader2, CheckCircle2, CalendarIcon, ChevronLeft, ChevronRight, XCircle } from "lucide-react"
import authService from "@/service/AuthService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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

  dateOfBirth: z.date()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return date < new Date();
    }, { message: "Date of birth must be in the past." })
    .refine((date) => {
      if (!date) return true;
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age;
      return adjustedAge >= 13;
    }, { message: "You must be at least 13 years old." }),

  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

// Definición de los pasos del formulario
const STEPS = [
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Contact", description: "Email and phone" },
  { id: 3, title: "Security", description: "Password and terms" },
]

export default function Register() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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
      dateOfBirth: undefined,
      termsAccepted: false,
    },
  })

  // Validar campos del paso actual
  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof RegisterFormData)[] = []
    
    switch (step) {
      case 1:
        fieldsToValidate = ['idNumber', 'name', 'lastName', 'dateOfBirth']
        break
      case 2:
        fieldsToValidate = ['email', 'phoneNumber']
        break
      case 3:
        fieldsToValidate = ['password', 'confirmPassword', 'termsAccepted']
        break
    }
    
    const result = await form.trigger(fieldsToValidate)
    return result
  }

  // Navegar al siguiente paso
  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navegar al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

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
        dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : undefined,
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
      // Obtener mensaje de error
      const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred'
      
      // Mostrar Alert de error
      setErrorMessage(errorMsg)
      setShowErrorAlert(true)
      
      // Toast de error con Sonner
      toast.error('Failed to create account', {
        description: errorMsg,
      })
      
      // Redirigir al paso correcto según el error
      const lowerErrorMsg = errorMsg.toLowerCase()
      if (lowerErrorMsg.includes('email') && lowerErrorMsg.includes('already')) {
        setCurrentStep(2) // Paso de contacto donde está el email
      } else if (lowerErrorMsg.includes('id') && lowerErrorMsg.includes('already')) {
        setCurrentStep(1) // Paso de información personal donde está el ID
      }
      
      // Ocultar el alert de error después de 5 segundos
      setTimeout(() => {
        setShowErrorAlert(false)
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center items-center">
            <CardTitle className="text-2xl font-bold">Registro</CardTitle>
          </div>
          <CardDescription className="text-center">
            {STEPS[currentStep - 1].description}
          </CardDescription>
          
          {/* Indicador de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-colors duration-300",
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            {/* Barra de progreso */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
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

          {/* Alert de error */}
          {showErrorAlert && (
            <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/20 animate-in fade-in-50 slide-in-from-top-5 duration-300">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">
                Registration failed
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* PASO 1: Información Personal */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">

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

                  {/* DATE OF BIRTH */}
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <ButtonUI
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isLoading}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </ButtonUI>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* PASO 2: Información de Contacto */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
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
                </div>
              )}

              {/* PASO 3: Seguridad */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">

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
                </div>
              )}

              {/* BOTONES DE NAVEGACIÓN */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <ButtonUI
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </ButtonUI>
                )}
                
                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className={cn("flex-1", currentStep === 1 && "w-full")}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </div>

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