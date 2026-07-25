/**
 * Authentication Context
 * Manages user authentication state across the app.
 * Provides login, logout, and user info to all components.
 */

import React, { createContext, useState, useContext, useEffect } from 'react'
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth'
import { auth } from '../services/firebase'
import toast from 'react-hot-toast'

// Create the context
const AuthContext = createContext()

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

// Provider component that wraps the app
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(null)
    const [error, setError] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Listen for auth state changes from Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                setUser(firebaseUser)
                setIsAuthenticated(true)

                try {
                    // Get the ID token for API authentication
                    const token = await firebaseUser.getIdToken()
                    setToken(token)
                    // Store token for API requests
                    localStorage.setItem('authToken', token)
                    localStorage.setItem('userEmail', firebaseUser.email)

                    // Set user data in localStorage for quick access
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        emailVerified: firebaseUser.emailVerified
                    }
                    localStorage.setItem('userData', JSON.stringify(userData))
                } catch (error) {
                    console.error('Error getting ID token:', error)
                    toast.error('Error authenticating user')
                }
            } else {
                // User is signed out
                setUser(null)
                setToken(null)
                setIsAuthenticated(false)
                localStorage.removeItem('authToken')
                localStorage.removeItem('userData')
                localStorage.removeItem('userEmail')
            }
            setLoading(false)
            setError(null)
        })

        // Cleanup subscription on unmount
        return unsubscribe
    }, [])

    // Refresh token periodically (every 30 minutes)
    useEffect(() => {
        if (!user) return

        const refreshToken = async () => {
            try {
                const newToken = await user.getIdToken(true) // Force refresh
                setToken(newToken)
                localStorage.setItem('authToken', newToken)
            } catch (error) {
                console.error('Token refresh error:', error)
            }
        }

        // Refresh token every 30 minutes
        const interval = setInterval(refreshToken, 30 * 60 * 1000)

        return () => clearInterval(interval)
    }, [user])

    // Login with email and password
    const login = async (email, password) => {
        try {
            setError(null)
            const result = await signInWithEmailAndPassword(auth, email, password)

            // Check if email is verified
            if (!result.user.emailVerified) {
                toast.warning('Please verify your email before logging in')
                // Optionally resend verification
                await sendEmailVerification(result.user)
                toast.info('Verification email resent')
                return result.user
            }

            toast.success(`Welcome back${result.user.displayName ? ', ' + result.user.displayName : ''}!`)
            return result.user
        } catch (error) {
            console.error('Login error:', error)
            setError(error.message)

            // User-friendly error messages
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

    // Register with email and password
    const register = async (email, password, displayName = '') => {
        try {
            setError(null)
            const result = await createUserWithEmailAndPassword(auth, email, password)

            // Update profile with display name
            if (displayName) {
                await updateProfile(result.user, {
                    displayName: displayName
                })
            }

            // Send email verification
            await sendEmailVerification(result.user)

            toast.success('Account created successfully! Please verify your email.')
            toast.info('Verification email sent to your inbox')

            return result.user
        } catch (error) {
            console.error('Registration error:', error)
            setError(error.message)

            let errorMessage = 'Registration failed'
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email is already registered'
                    break
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format'
                    break
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak'
                    break
                default:
                    errorMessage = error.message
            }

            toast.error(errorMessage)
            throw error
        }
    }

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            setError(null)
            const provider = new GoogleAuthProvider()
            provider.setCustomParameters({
                prompt: 'select_account'
            })

            const result = await signInWithPopup(auth, provider)

            // Create user data in Firestore (optional)
            // await createUserDocument(result.user)

            toast.success(`Welcome${result.user.displayName ? ', ' + result.user.displayName : ''}!`)
            return result.user
        } catch (error) {
            console.error('Google login error:', error)
            setError(error.message)

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

    // Login with Google (redirect method - better for mobile)
    const loginWithGoogleRedirect = async () => {
        try {
            setError(null)
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider) // Use signInWithRedirect for production
        } catch (error) {
            console.error('Google redirect login error:', error)
            setError(error.message)
            toast.error('Google login failed')
            throw error
        }
    }

    // Reset password
    const resetPassword = async (email) => {
        try {
            setError(null)
            await sendPasswordResetEmail(auth, email, {
                url: window.location.origin + '/login',
                handleCodeInApp: true
            })
            toast.success('Password reset email sent! Check your inbox.')
            return true
        } catch (error) {
            console.error('Password reset error:', error)
            setError(error.message)

            let errorMessage = 'Failed to send reset email'
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email'
            } else {
                errorMessage = error.message
            }

            toast.error(errorMessage)
            throw error
        }
    }

    // Resend verification email
    const resendVerificationEmail = async () => {
        if (!user) {
            toast.error('No user logged in')
            return false
        }

        try {
            await sendEmailVerification(user)
            toast.success('Verification email resent!')
            return true
        } catch (error) {
            console.error('Resend verification error:', error)
            toast.error('Failed to send verification email')
            return false
        }
    }

    // Update user profile
    const updateUserProfile = async (data) => {
        if (!user) {
            toast.error('No user logged in')
            return false
        }

        try {
            await updateProfile(user, data)

            // Update local user state
            setUser({
                ...user,
                ...data
            })

            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}')
            localStorage.setItem('userData', JSON.stringify({
                ...userData,
                ...data
            }))

            toast.success('Profile updated successfully!')
            return true
        } catch (error) {
            console.error('Profile update error:', error)
            toast.error('Failed to update profile')
            return false
        }
    }

    // Logout
    const logout = async () => {
        try {
            setError(null)
            await signOut(auth)
            setUser(null)
            setToken(null)
            setIsAuthenticated(false)
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
            localStorage.removeItem('userEmail')
            toast.success('Logged out successfully')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Error logging out')
            throw error
        }
    }

    // Get user data from localStorage (for quick access)
    const getUserData = () => {
        const userData = localStorage.getItem('userData')
        return userData ? JSON.parse(userData) : null
    }

    // Check if token is expired
    const isTokenExpired = () => {
        if (!token) return true

        try {
            // JWT tokens have an 'exp' field
            const tokenParts = token.split('.')
            if (tokenParts.length < 3) return true

            const payload = JSON.parse(atob(tokenParts[1]))
            const currentTime = Math.floor(Date.now() / 1000)
            return payload.exp < currentTime
        } catch (error) {
            return true
        }
    }

    // Value provided to consuming components
    const value = {
        // State
        user,
        token,
        loading,
        error,
        isAuthenticated,

        // Auth methods
        login,
        register,
        loginWithGoogle,
        loginWithGoogleRedirect,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserProfile,

        // Utility methods
        getUserData,
        isTokenExpired,

        // User info helpers
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
            return <div>Loading...</div> // Replace with your loading component
        }

        if (!user) {
            // Redirect to login
            window.location.href = '/login'
            return null
        }

        return <Component {...props} />
    }
}

// Hook to get auth token for API calls
export function useAuthToken() {
    const { token } = useAuth()
    return token
}

// Hook to get user role or permissions (if using Firestore)
export function useUserRole() {
    const { user } = useAuth()
    const [role, setRole] = useState('user')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        // Fetch user role from Firestore
        // This is a placeholder - implement your own role fetching logic
        const fetchUserRole = async () => {
            try {
                // Example: const doc = await getDoc(doc(db, 'users', user.uid))
                // if (doc.exists()) setRole(doc.data().role || 'user')
                setLoading(false)
            } catch (error) {
                console.error('Error fetching user role:', error)
                setLoading(false)
            }
        }

        fetchUserRole()
    }, [user])

    return { role, loading, isAdmin: role === 'admin' }
}

export default AuthContext