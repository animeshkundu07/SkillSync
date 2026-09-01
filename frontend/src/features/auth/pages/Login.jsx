import React, { useState } from "react"
import "../auth.form.scss"
import { Link, useNavigate } from "react-router"
import { useAuth } from "../hooks/useAuth"

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError("")

        try {
            await handleLogin({
                email,
                password,
            })

            navigate("/")
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid email or password"
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
                <h1>Login</h1>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
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
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>
                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </div>
        </main>
    )
}

export default Login

