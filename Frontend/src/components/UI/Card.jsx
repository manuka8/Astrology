import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)' } : {}}
            className={`glass-morphism rounded-2xl p-6 transition-all duration-300 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
