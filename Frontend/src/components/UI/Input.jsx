import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, name, required = false }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-gold-light/80 text-sm font-medium ml-1">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="bg-mystic-light/50 border border-mystic/10 rounded-xl px-4 py-3 text-mystic placeholder:text-mystic/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300"
            />
        </div>
    );
};

export default Input;
