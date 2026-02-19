import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
    const baseStyles = "px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-gold/50";

    const variants = {
        primary: "bg-gold-gradient text-mystic hover:shadow-gold transform hover:-translate-y-0.5 active:scale-95 shadow-lg",
        outline: "border-2 border-gold text-gold hover:bg-gold/10 transform hover:-translate-y-0.5 active:scale-95",
        ghost: "text-white/70 hover:bg-white/5 hover:text-gold transition-colors",
        glass: "glass-morphism text-white hover:border-gold/50 hover:bg-white/10 shadow-lg"
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default Button;
