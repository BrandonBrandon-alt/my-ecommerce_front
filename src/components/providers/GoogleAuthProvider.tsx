'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  // Debug: verificar que el Client ID se está cargando
  console.log('Google Client ID loaded:', googleClientId ? 'Yes' : 'No')
  console.log('Client ID length:', googleClientId.length)

  if (!googleClientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined')
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
