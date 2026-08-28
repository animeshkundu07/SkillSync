// import { createContext, useState } from "react";


// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null)
//     const [loading, setLoading] = useState(true)
    


//     return (
//         <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
//             {children}
//         </AuthContext.Provider>
//     )
// }


import {
    createContext,
    useEffect,
    useState
} from "react"

import {
    getMe
} from "./services/auth.api"


export const AuthContext = createContext(null)


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)

    const [loading, setLoading] = useState(true)


    useEffect(() => {

        const checkAuth = async () => {

            try {

                const data = await getMe()

                console.log("Current user:", data)

                setUser(data.user)

            } catch (error) {

                console.log(
                    "User is not authenticated:",
                    error.response?.data || error.message
                )

                setUser(null)

            } finally {

                setLoading(false)

            }
        }


        checkAuth()

    }, [])


    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}