import {
    useContext,
    useEffect,
} from "react"

import { AuthContext } from "../auth.context"
import {
    login,
    register,
    logout,
    getMe,
} from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        )
    }

    const {
        user,
        setUser,
        loading,
        setLoading,
    } = context

    const handleLogin = async ({
        email,
        password,
    }) => {
        setLoading(true)

        try {
            const data = await login({
                email,
                password,
            })

            setUser(data.user)

            return data
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({
        username,
        email,
        password,
    }) => {
        setLoading(true)

        try {
            const data = await register({
                username,
                email,
                password,
            })

            setUser(data.user)

            return data
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
    setLoading(true)

    try {
        await logout()
        setUser(null)
    } catch (error) {
        console.error("Logout failed:", error)
        throw error
    } finally {
        setLoading(false)
    }
}

    useEffect(() => {
        let mounted = true

        const getAndSetUser = async () => {
            try {
                const data = await getMe()

                if (mounted) {
                    setUser(data.user)
                }
            } catch (error) {
                // 401 simply means user isn't logged in
                if (mounted) {
                    setUser(null)
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        getAndSetUser()

        return () => {
            mounted = false
        }
    }, [setUser, setLoading])

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
    }
}

