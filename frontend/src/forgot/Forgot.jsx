import React, { useState } from 'react';
import './Forgot.css';

function Forgot() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1: Send OTP to email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("https://arshit-enterprises-backend.onrender.com/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                setMessage(data.message);
                setStep(2); // Move to OTP verification step
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Error sending email. Please try again.");
            console.error("Email error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("https://arshit-enterprises-backend.onrender.com/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                setMessage(data.message);
                setStep(3); // Move to password reset step
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Error verifying OTP. Please try again.");
            console.error("OTP verification error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("https://arshit-enterprises-backend.onrender.com/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                setMessage(data.message);
                // Reset form after successful password reset
                setTimeout(() => {
                    setStep(1);
                    setEmail("");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setMessage("");
                    setError("");
                }, 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Error resetting password. Please try again.");
            console.error("Password reset error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Reset to step 1
    const handleBackToEmail = () => {
        setStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setMessage("");
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', margin: '11% 0', color: '#585f65ff' }}>
            <div className="forgot-password">
                {step === 1 && (
                    <>
                        <h2>Forgot Password</h2>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            Enter your registered email address to receive an OTP
                        </p>
                        <form onSubmit={handleEmailSubmit} className='forgot-form'>
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Verify OTP</h2>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            Enter the 6-digit OTP sent to {email}
                        </p>
                        <form onSubmit={handleOtpSubmit} className='forgot-form'>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                                    if (value.length <= 6) {
                                        setOtp(value);
                                    }
                                }}
                                disabled={loading}
                                maxLength="6"
                                required
                            />
                            <button 
                                type="submit"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleBackToEmail}
                                disabled={loading}
                            >
                                Back to Email
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2>Reset Password</h2>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            Enter your new password
                        </p>
                        <form onSubmit={handlePasswordReset} className='forgot-form'>
                            <input
                                type="password"
                                placeholder="New Password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                minLength="6"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                minLength="6"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleBackToEmail}
                                disabled={loading}
                            >
                                Start Over
                            </button>
                        </form>
                    </>
                )}

                {message && (
                    <div style={{ 
                        padding: '10px', 
                        background: '#d4edda', 
                        color: '#155724', 
                        borderRadius: '5px', 
                        marginTop: '10px',
                        fontSize: '14px'
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{ 
                        padding: '10px', 
                        background: '#f8d7da', 
                        color: '#721c24', 
                        borderRadius: '5px', 
                        marginTop: '10px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Forgot;
