import React, { createContext, useContext } from 'react'
const ProductContext = createContext()
export function ProductProvider({ children }) { return <ProductContext.Provider value={{}}>{children}</ProductContext.Provider> }
export function useProducts() { return useContext(ProductContext) }
