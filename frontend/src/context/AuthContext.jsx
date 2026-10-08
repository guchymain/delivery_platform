import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('delivery_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('delivery_token') || null
  })

  const [loading, setLoading] = useState(true)

  // Verify and refresh user details upon initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('delivery_token')
      if (storedToken) {
        try {
          const data = await authAPI.getMe()
          setUser(data.user)
          localStorage.setItem('delivery_user', JSON.stringify(data.user))
        } catch {
          // Token is invalid/expired
          localStorage.removeItem('delivery_token')
          localStorage.removeItem('delivery_user')
          setUser(null)
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()

    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
      toast.error('Session expired. Please log in again.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (emailOrObj, maybePassword) => {
    try {
      const payload = typeof emailOrObj === 'string'
        ? { email: emailOrObj, password: maybePassword }
        : emailOrObj;
      const data = await authAPI.login(payload);
      localStorage.setItem('delivery_token', data.token)
      localStorage.setItem('delivery_user', JSON.stringify(data.user))
      setUser(data.user)
      setToken(data.token)
      toast.success(data.message || 'Logged in successfully')
      return data.user
    } catch (err) {
      toast.error(err.message || 'Failed to log in')
      throw err
    }
  }

  const register = async (payload) => {
    try {
      const data = await authAPI.register(payload)
      localStorage.setItem('delivery_token', data.token)
      localStorage.setItem('delivery_user', JSON.stringify(data.user))
      setUser(data.user)
      setToken(data.token)
      toast.success(data.message || 'Registered successfully')
      return data.user
    } catch (err) {
      toast.error(err.message || 'Registration failed')
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('delivery_token')
    localStorage.removeItem('delivery_user')
    setUser(null)
    setToken(null)
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    try {
      const data = await authAPI.getMe()
      setUser(data.user)
      localStorage.setItem('delivery_user', JSON.stringify(data.user))
      return data.user
    } catch {
      return null
    }
  }

  const updateProfile = async (updates) => {
    try {
      const data = await usersAPI.updateProfile(updates)
      setUser(data.user)
      localStorage.setItem('delivery_user', JSON.stringify(data.user))
      toast.success('Profile updated successfully')
      return data.user
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
      throw err
    }
  }

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
