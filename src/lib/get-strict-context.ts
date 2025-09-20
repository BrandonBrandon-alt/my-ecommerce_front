import * as React from 'react';

/**
 * Crea un contexto estricto que retorna un Provider y un hook
 * Exactamente como lo usa tu código de particles.tsx
 */
export function getStrictContext<T>(displayName: string) {
  const Context = React.createContext<T | null>(null);
  Context.displayName = displayName;

  // Provider component
  const Provider: React.ComponentType<{ value: T; children: React.ReactNode }> = ({ value, children }) => {
    return React.createElement(Context.Provider, { value }, children);
  };

  // Hook para usar el contexto
  function useStrictContext(): T {
    const value = React.useContext(Context);
    if (value === null || value === undefined) {
      throw new Error(
        `El hook para ${displayName} debe ser usado dentro de su ${displayName}Provider`
      );
    }
    return value;
  }

  return [Provider, useStrictContext] as const;
}