// import { useContext,useEffect } from "react";
// import { AuthContext } from "../auth.context";
// import {login, register, logout, getMe} from "../services/auth.api";

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     const {user, setUser, loading, setLoading} = context; 

//     const handleLogin = async({email,password}) => {
//         setLoading(true);
//         try{
//             const data = await login({email,password});
//             setUser(data.user);
//         }catch(err){
//             console.log("Login error: ",err);
//         }finally{
//             setLoading(false);
//         }
        
        
//     }

//     const handleRegister = async({username, email,password}) => {
//         setLoading(true);
//         try {
//             const data = await register({username,email,password});
//             setUser(data.user);
//         } catch (err) {
//             console.log("Register error:", err);
//         } finally{
//             setLoading(false);
//         }
        
        
//     }

//     const handleLogout = async() => {
//         setLoading(true);
//         try {
//             const data = await logout();
//             setUser(null);
//         } catch (err) {
//             console.log("Logout error:", err);
//         }finally{
//             setLoading(false);
//         }
        
        
//     }

//     useEffect(() => {

//         const getAndSetUser = async () => {
//             try {

//                 const data = await getMe()
//                 setUser(data.user)
//             } catch (err) { } finally {
//                 setLoading(false)
//             }
//         }

//         getAndSetUser()

//     }, [])

//     return {user, loading, handleRegister, handleLogin, handleLogout}

// }

import { useContext } from "react"

import {
    AuthContext
} from "../auth.context"

import {
    login,
    register,
    logout
} from "../services/auth.api"


export const useAuth = () => {

    const context = useContext(AuthContext)


    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        )
    }


    const {
        user,
        setUser,
        loading,
        setLoading
    } = context


    const handleLogin = async ({ email, password }) => {

        setLoading(true)

        try {

            const data = await login({
                email,
                password
            })

            console.log(
                "Login response:",
                data
            )

            setUser(data.user)

            return data.user

        } catch (error) {

            console.log(
                "Login failed:",
                error.response?.data || error.message
            )

            throw error

        } finally {

            setLoading(false)

        }
    }


    const handleRegister = async ({
        username,
        email,
        password
    }) => {

        setLoading(true)

        try {

            const data = await register({
                username,
                email,
                password
            })

            console.log(
                "Register response:",
                data
            )

            setUser(data.user)

            return data.user

        } catch (error) {

            console.log(
                "Register failed:",
                error.response?.data || error.message
            )

            throw error

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

            console.log(
                "Logout failed:",
                error.response?.data || error.message
            )

        } finally {

            setLoading(false)

        }
    }


    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout
    }
}