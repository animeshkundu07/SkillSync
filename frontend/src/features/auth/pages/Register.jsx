import React, { useState } from "react"
import {
    useNavigate,
    Link,
} from "react-router"

import { useAuth } from "../hooks/useAuth"

const Register = () => {
    const navigate = useNavigate()

    const {
        loading,
        handleRegister,
    } = useAuth()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError("")

        try {
            await handleRegister({
                username,
                email,
                password,
            })

            navigate("/")
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            )
        }
    }

    if (loading) {
        return (
            <main>
                <h1>Loading...</h1>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <img src="/logo-wordmark.svg" alt="SkillSync" style={{ height: '48px', marginBottom: '1rem' }} />
                <h1>Register</h1>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            type="text"
                            id="username"
                            required
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            type="email"
                            id="email"
                            required
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            type="password"
                            id="password"
                            required
                            minLength={6}
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>
                </form>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </div>
        </main>
    )
}

export default Register

