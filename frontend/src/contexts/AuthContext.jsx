// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onIdTokenChanged
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const token = await firebaseUser.getIdToken()
          localStorage.setItem('authToken', token)
          // Fetch user profile
          const response = await userAPI.getProfile(token)
          setUserProfile(response.data)
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Fallback - set default profile
          setUserProfile({
            role: 'staff',
            role_display: 'Sales Staff',
            email: firebaseUser.email
          })
        }
      } else {
        setUser(null)
        setUserProfile(null)
        localStorage.removeItem('authToken')
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
      setUserProfile(null)
      toast.success('Logged out successfully')
      return true
    } catch (error) {
      toast.error('Error logging out')
      return false
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isManager: userProfile?.role === 'manager' || userProfile?.role === 'admin',
    isStaff: userProfile?.role === 'staff'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
