import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/#about' },
        { name: 'Features', path: '/#features' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-white shadow-md py-3' 
                    : 'bg-white/95 backdrop-blur-sm py-4'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                            <GraduationCap className="h-7 w-7 text-primary" />
                        </div>
                        <span className="text-2xl font-bold text-text-dark">
                            Grad<span className="text-primary">Connect</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-semibold transition-colors duration-200 hover:text-primary relative ${
                                    isActive(link.path) ? 'text-primary' : 'text-gray-600'
                                }`}
                            >
                                {link.name}
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-gray-700 hover:text-primary font-semibold text-sm transition-colors duration-200"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2.5 bg-primary hover:bg-secondary text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-primary focus:outline-none transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white border-t border-light-gray overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                                        isActive(link.path)
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-off-white hover:text-primary'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-light-gray space-y-3">
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-3 bg-off-white text-gray-700 hover:bg-light-gray rounded-lg font-semibold text-base transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-semibold text-base transition-colors shadow-lg shadow-primary/30"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
