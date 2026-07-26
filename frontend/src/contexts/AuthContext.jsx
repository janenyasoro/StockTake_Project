import React, { createContext, useState, useContext, useEffect } from 'react'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext()
export function useAuth() { return useContext(AuthContext) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        localStorage.setItem('authToken', token)
        setUser(firebaseUser)
      } else {
        localStorage.removeItem('authToken')
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      return result.user
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      toast.success('Welcome back!')
      return result.user
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
