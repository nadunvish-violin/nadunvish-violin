'use client'

import { createContext, useContext } from 'react'

const HeaderVisibilityContext = createContext(true)

export function HeaderVisibilityProvider({ visible, children }) {
  return (
    <HeaderVisibilityContext.Provider value={visible}>
      {children}
    </HeaderVisibilityContext.Provider>
  )
}

export function useHeaderVisibility() {
  return useContext(HeaderVisibilityContext)
}
