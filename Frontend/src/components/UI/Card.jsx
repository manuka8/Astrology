import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)' } : {}}
            className={`glass-morphism rounded-2xl p-6 transition-all duration-300 bg-white/80 border border-gold/10 shadow-premium ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
