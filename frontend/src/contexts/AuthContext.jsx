import React, { createContext, useState, useContext, useEffect } from 'react'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext()
export function useAuth() { return useContext(AuthContext) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  // Fetch user role from backend
  const fetchUserRole = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/user/role/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user role')
      }

      const data = await response.json()
      setUserRole(data)
      localStorage.setItem('userRole', JSON.stringify(data))
      return data
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole(null)
      localStorage.removeItem('userRole')
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          localStorage.setItem('authToken', token)
          setUser(firebaseUser)
          setIsAuthenticated(true)

          // Store user data
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified
          }
          localStorage.setItem('userData', JSON.stringify(userData))

          // Fetch user role
          await fetchUserRole(token)
        } catch (error) {
          console.error('Error initializing user:', error)
        }
      } else {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('userRole')
        setUser(null)
        setUserRole(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Check if email is verified
      if (!result.user.emailVerified) {
        toast.warning('Please verify your email before logging in')
        return result.user
      }

      // Get token and fetch role
      const token = await result.user.getIdToken()
      await fetchUserRole(token)

      toast.success(`Welcome back${result.user.displayName ? ', ' + result.user.displayName : ''}!`)
      return result.user
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed'
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Invalid password'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later'
          break
        default:
          errorMessage = error.message
      }
      toast.error(errorMessage)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const result = await signInWithPopup(auth, provider)

      // Get token and fetch role
      const token = await result.user.getIdToken()
      await fetchUserRole(token)

      toast.success(`Welcome${result.user.displayName ? ', ' + result.user.displayName : ''}!`)
      return result.user
    } catch (error) {
      console.error('Google login error:', error)
      let errorMessage = 'Google login failed'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelled'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked by browser'
      } else {
        errorMessage = error.message
      }
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserRole(null)
      setIsAuthenticated(false)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userRole')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  // Role checking functions
  const hasRole = (roles) => {
    if (!userRole) return false
    if (Array.isArray(roles)) {
      return roles.includes(userRole.role)
    }
    return userRole.role === roles
  }

  const isAdmin = () => userRole?.role === 'ADMIN'
  const isSalesAgent = () => userRole?.role === 'SALES_AGENT'
  const isInventoryManager = () => userRole?.role === 'INVENTORY_MANAGER'

  const value = {
    user,
    userRole,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    hasRole,
    isAdmin,
    isSalesAgent,
    isInventoryManager,
    // Helper properties
    displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    uid: user?.uid || '',
    emailVerified: user?.emailVerified || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Higher-order component to protect routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth()

    if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    }

    if (!user) {
      window.location.href = '/login'
      return null
    }

    return <Component {...props} />
  }
}
