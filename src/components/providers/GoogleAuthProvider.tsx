'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Si no hay Client ID configurado, renderizar sin el provider de Google
  if (!googleClientId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado.\n' +
        'El login con Google estará deshabilitado.\n' +
        'Para habilitarlo, crea un archivo .env.local con tu Google Client ID.\n' +
        'Ver ENV_SETUP.md para más información.'
      )
    }
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
