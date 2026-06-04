import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, GraduationCap, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { z } from 'zod';

// Zod validation schema with strong password requirements
const signupSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'alumni', 'admin']),
    // Optional fields for students
    graduation_year: z.number().optional(),
    department: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine((data) => {
    // Validate college email for students
    if (data.role === 'student') {
        const email = data.email.toLowerCase();
        return email.endsWith('.edu') || email.includes('college') || email.includes('university') || email.includes('.ac.');
    }
    return true;
}, {
    message: "Students must register with a college/university email (.edu, college, or university domain)",
    path: ['email'],
}).refine((data) => {
    // Require graduation year for students
    if (data.role === 'student' && !data.graduation_year) {
        return false;
    }
    return true;
}, {
    message: "Graduation year is required for students",
    path: ['graduation_year'],
}).refine((data) => {
    // Require department for students
    if (data.role === 'student' && !data.department) {
        return false;
    }
    return true;
}, {
    message: "Department is required for students",
    path: ['department'],
});

// Password strength calculator
const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    let label = 'Weak';
    let color = 'bg-red-500';

    if (strength >= 70) {
        label = 'Strong';
        color = 'bg-primary';
    } else if (strength >= 40) {
        label = 'Medium';
        color = 'bg-yellow-500';
    }

    return { strength, label, color };
};

const Signup: React.FC = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as UserRole,
        graduation_year: new Date().getFullYear() + 4,
        department: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    const passwordStrength = calculatePasswordStrength(formData.password);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        setCapsLockOn(e.getModifierState('CapsLock'));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'graduation_year' ? parseInt(value) || new Date().getFullYear() + 4 : value 
        }));
        // Clear specific field error and general error
        if (errors[name]) {
            const newErrors = { ...errors };
            delete newErrors[name];
            delete newErrors.general;
            setErrors(newErrors);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        // Dummy signup - just redirect based on role
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
        <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-off-white via-white to-primary/5 flex items-center justify-center p-4 py-12">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="bg-white border border-light-gray shadow-2xl rounded-3xl p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ translateY: -20, opacity: 0 }}
                            animate={{ translateY: 0, opacity: 1 }}
                            className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-105 transition-transform duration-300"
                        >
                            <GraduationCap className="text-white w-8 h-8" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-text-dark mb-2">Create Account</h1>
                        <p className="text-gray-600">Join the GradConnect community</p>
                    </div>

                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                        >
                            <AlertCircle size={18} />
                            <span>{errors.general}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Full Name</label>
                            <div className={`relative rounded-xl border-2 ${errors.full_name ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={20} /></div>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-transparent text-text-dark pl-12 pr-4 py-3.5 focus:outline-none placeholder-gray-400" placeholder="John Doe" disabled={loading} />
                            </div>
                            {errors.full_name && <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />{errors.full_name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Email Address</label>
                            <div className={`relative rounded-xl border-2 ${errors.email ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={20} /></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent text-text-dark pl-12 pr-4 py-3.5 focus:outline-none placeholder-gray-400" placeholder="you@example.com" disabled={loading} />
                            </div>
                            {errors.email && <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />{errors.email}</p>}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">I am a</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white text-text-dark border-2 border-light-gray focus:border-primary px-4 py-3.5 rounded-xl focus:outline-none focus:bg-primary/5 transition-colors" disabled={loading}>
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        {/* Conditional Fields for Students */}
                        {formData.role === 'student' && (
                            <>
                                <div>
                                    <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Expected Graduation Year</label>
                                    <div className={`relative rounded-xl border-2 ${errors.graduation_year ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'}`}>
                                        <input
                                            type="number"
                                            name="graduation_year"
                                            value={formData.graduation_year}
                                            onChange={(e) => setFormData(prev => ({ ...prev, graduation_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                                            min={new Date().getFullYear()}
                                            max={new Date().getFullYear() + 10}
                                            className="w-full bg-transparent text-text-dark px-4 py-3.5 focus:outline-none placeholder-gray-400"
                                            placeholder="2026"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.graduation_year && <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />{errors.graduation_year}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Department / Major</label>
                                    <div className={`relative rounded-xl border-2 ${errors.department ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'}`}>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full bg-transparent text-text-dark px-4 py-3.5 focus:outline-none placeholder-gray-400"
                                            placeholder="Computer Science"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.department && <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />{errors.department}</p>}
                                    <p className="text-xs text-gray-500 mt-1.5 ml-1">📧 Students must use college email (.edu domain)</p>
                                </div>
                            </>
                        )}

                        {/* Password */}
                        <div>
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Password</label>
                            <div className={`relative rounded-xl border-2 ${errors.password ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onKeyDown={handleKeyDown} className="w-full bg-transparent text-text-dark pl-12 pr-12 py-3.5 focus:outline-none placeholder-gray-400" placeholder="Create a strong password" disabled={loading} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-600">Password Strength:</span>
                                        <span className={`font-semibold ${passwordStrength.strength >= 70 ? 'text-primary' : passwordStrength.strength >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${passwordStrength.strength}%` }} transition={{ duration: 0.3 }} className={`h-full ${passwordStrength.color}`} />
                                    </div>
                                </div>
                            )}
                            {errors.password && <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />{errors.password}</p>}
                            {capsLockOn && <p className="text-yellow-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />Caps Lock is ON</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-semibold text-text-dark ml-1 mb-2 block">Confirm Password</label>
                            <div className={`relative rounded-xl border-2 ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-light-gray focus-within:border-primary focus-within:bg-primary/5'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-transparent text-text-dark pl-12 pr-12 py-3.5 focus:outline-none placeholder-gray-400" placeholder="Confirm your password" disabled={loading} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1.5 ml-1 flex items-center gap-1"><AlertCircle size={14} />{errors.confirmPassword}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6">
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-light-gray to-transparent" />
                        <span className="text-sm text-gray-500 font-medium">OR</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-light-gray to-transparent" />
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-secondary font-bold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <ShieldCheck size={16} className="text-primary" />
                        Protected by industry-leading security standards
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
