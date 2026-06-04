import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';

// Zod validation schema
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const Login: React.FC = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false, role: 'student' as 'student' | 'alumni' | 'admin' });
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string; role?: string }>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    // Check for Caps Lock
    const handleKeyDown = (e: React.KeyboardEvent) => {
        setCapsLockOn(e.getModifierState('CapsLock'));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        // Dummy login - just redirect based on role
        setTimeout(() => {
            // Navigate based on role
            if (formData.role === 'student') {
                window.location.href = '/student/dashboard';
            } else if (formData.role === 'alumni') {
                window.location.href = '/alumni/dashboard';
            } else if (formData.role === 'admin') {
                window.location.href = '/admin/dashboard';
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-off-white via-white to-primary/5 flex items-center justify-center p-4">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white border border-light-gray shadow-2xl rounded-3xl p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-300"
                        >
                            <GraduationCap className="text-white w-8 h-8" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-text-dark mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to your GradConnect account</p>
                    </div>

                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                        >
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{errors.general}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">I am a</label>
                            <div className={`relative transition-all duration-300 rounded-xl border-2 ${
                                errors.role ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'
                            }`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <GraduationCap size={20} />
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-text-dark pl-12 pr-4 py-3.5 focus:outline-none appearance-none cursor-pointer"
                                    disabled={loading}
                                >
                                    <option value="student">Student</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {errors.role && (
                                <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Email Address</label>
                            <div className={`relative transition-all duration-300 rounded-xl border-2 ${
                                errors.email ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'
                            }`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent text-text-dark pl-12 pr-4 py-3.5 focus:outline-none placeholder-gray-400"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Password</label>
                            <div className={`relative transition-all duration-300 rounded-xl border-2 ${
                                errors.password ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'
                            }`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent text-text-dark pl-12 pr-12 py-3.5 focus:outline-none placeholder-gray-400"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.password}
                                </p>
                            )}
                            {capsLockOn && (
                                <p className="text-yellow-600 text-sm mt-1.5 ml-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    Caps Lock is ON
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-gray-700 group-hover:text-primary transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-primary hover:text-secondary font-semibold transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-light-gray to-transparent" />
                        <span className="text-sm text-gray-500 font-medium">OR</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-light-gray to-transparent" />
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:text-secondary font-bold transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="text-primary" />
                        Secured with industry-standard encryption
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
