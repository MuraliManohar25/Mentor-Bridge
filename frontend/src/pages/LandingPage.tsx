import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, Calendar, ChevronRight, Star, ArrowRight, GraduationCap, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const revealImageRef = useRef<HTMLDivElement>(null);
    const cursorPosRef = useRef({ x: 0, y: 0 });
    const currentPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const handleMouseMove = (e: MouseEvent) => {
            cursorPosRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animateReveal = () => {
            if (!revealImageRef.current) return;
            
            // Very high interpolation factor for tight, responsive following
            currentPosRef.current.x += (cursorPosRef.current.x - currentPosRef.current.x) * 0.45;
            currentPosRef.current.y += (cursorPosRef.current.y - currentPosRef.current.y) * 0.45;

            gsap.set(revealImageRef.current, {
                x: currentPosRef.current.x,
                y: currentPosRef.current.y,
                xPercent: -50,
                yPercent: -50,
            });

            requestAnimationFrame(animateReveal);
        };

        animateReveal();
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isMobile]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            {/* SVG Filters and Clip Path */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <clipPath id="heroTextClip">
                        <text
                            x="50%"
                            y="35%"
                            textAnchor="middle"
                            fontSize="clamp(2rem, 6vw, 4.5rem)"
                            fontWeight="800"
                        >
                            Connect, Grow, Succeed
                        </text>
                        <text
                            x="50%"
                            y="45%"
                            textAnchor="middle"
                            fontSize="clamp(2rem, 6vw, 4.5rem)"
                            fontWeight="800"
                        >
                            with Your Alumni Network
                        </text>
                    </clipPath>
                </defs>
            </svg>

            {/* Cursor Following Image Reveal (Desktop Only) */}
            {!isMobile && (
                <div
                    ref={revealImageRef}
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80)',
                        position: 'fixed',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        pointerEvents: 'none',
                        zIndex: 50,
                        mixBlendMode: 'screen',
                        opacity: 1,
                        clipPath: 'url(#heroTextClip)',
                        filter: 'brightness(1.2) contrast(1.1)',
                    }}
                />
            )}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-off-white to-white">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-sm font-semibold text-primary">Trusted by 5,000+ Alumni</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-extrabold text-text-dark tracking-tight leading-tight mb-6">
                                Connect, Grow, Succeed <br />
                                <span className="text-primary relative inline-block">
                                    with Your Alumni Network
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                                GradConnect bridges the gap between students and alumni. Unlock mentorships,
                                discover career opportunities, and build lifelong professional relationships.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                                <Link
                                    to="/signup"
                                    className="group w-full sm:w-auto px-8 py-4 bg-primary hover:bg-secondary text-white rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    Join Now 
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="#features"
                                    className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary rounded-full font-bold text-lg transition-all duration-300 hover:bg-off-white flex items-center justify-center gap-2"
                                >
                                    Learn More
                                </a>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-accent" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-accent" />
                                    <span>Free forever</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-accent" />
                                    <span>Instant access</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image / Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="mt-20 relative mx-auto max-w-6xl"
                    >
                        <div className="relative bg-gradient-to-br from-white to-off-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-8 overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                            
                            {/* Content */}
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Mentorship', icon: Users, color: 'primary', count: '1,200+' },
                                    { title: 'Job Openings', icon: Briefcase, color: 'accent', count: '850+' },
                                    { title: 'Events', icon: Calendar, color: 'secondary', count: '300+' }
                                ].map((item, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg p-6 border border-light-gray hover:border-primary/30 transform hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <div className={`h-14 w-14 rounded-xl bg-${item.color}/10 flex items-center justify-center mb-4`}>
                                            <item.icon className={`h-7 w-7 text-${item.color}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-text-dark mb-1">{item.count}</h3>
                                        <p className="text-gray-600 font-medium">{item.title}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Stats */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-light-gray hidden lg:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-accent/20 rounded-xl">
                                    <Users size={24} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold">Active Alumni</p>
                                    <p className="text-2xl font-bold text-primary">5,000+</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-primary font-bold tracking-wide uppercase mb-3">Why GradConnect?</h2>
                        <h3 className="text-4xl md:text-5xl leading-tight font-extrabold text-text-dark mb-4">
                            Empowering Your <span className="text-primary">Professional Journey</span>
                        </h3>
                        <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto leading-relaxed">
                            Everything you need to network, grow, and succeed in one powerful platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="h-10 w-10" />,
                                title: 'Mentorship Programs',
                                description: 'Connect with experienced alumni who can guide you through your career path and provide valuable industry insights.',
                                color: 'primary',
                            },
                            {
                                icon: <Briefcase className="h-10 w-10" />,
                                title: 'Job Placement',
                                description: 'Access exclusive job openings and internship opportunities shared directly by alumni within their organizations.',
                                color: 'accent',
                            },
                            {
                                icon: <Calendar className="h-10 w-10" />,
                                title: 'Networking Events',
                                description: 'Stay updated with reunions, webinars, and networking meetups happening in your city or online.',
                                color: 'secondary',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="group bg-white rounded-3xl p-8 shadow-sm border-2 border-light-gray hover:border-primary hover:shadow-2xl transition-all duration-300"
                            >
                                <div className={`bg-${feature.color}/10 text-${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-2xl font-bold text-text-dark mb-4">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {feature.description}
                                </p>
                                <a href="#" className="inline-flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                                    Learn more <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About/Testimonials Section */}
            <section id="about" className="py-24 bg-gradient-to-b from-off-white to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6 leading-tight">
                                What our <span className="text-primary">Community Says</span>
                            </h2>
                            <div className="space-y-6">
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    "GradConnect has been a game-changer for my career. I found my current mentor here,
                                    and their guidance helped me land my dream job at a top tech firm."
                                </p>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-current" />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-8 p-4 bg-white rounded-2xl border border-light-gray">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-text-dark font-bold text-lg">Sarah Jenkins</p>
                                    <p className="text-gray-500 text-sm">Class of 2021 • Software Engineer at Google</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-10 md:p-14 text-white relative overflow-hidden shadow-2xl"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 text-center">
                                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <GraduationCap className="h-12 w-12" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-4">Join 5,000+ Alumni Today</h3>
                                <p className="text-white/90 text-lg mb-8 max-w-md mx-auto">
                                    Ready to unlock your potential and connect with incredible professionals?
                                </p>
                                <Link 
                                    to="/signup" 
                                    className="inline-block bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-off-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                                >
                                    Get Started Today
                                </Link>
                                <p className="text-white/70 text-sm mt-6">No credit card required • Free forever</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-text-dark text-gray-400 py-16 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1">
                            <div className="flex items-center gap-2 text-white mb-4">
                                <div className="bg-primary p-2 rounded-lg">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold">GradConnect</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Connecting alumni and students for a brighter, more successful future.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4 text-lg">Platform</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4 text-lg">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4 text-lg">Connect</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} GradConnect. All rights reserved.
                        </p>
                        <div className="flex gap-6 mt-4 md:mt-0 text-sm">
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
