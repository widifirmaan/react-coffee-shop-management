import React from 'react';

export const Badge = ({ children, variant = 'default', style = {} }) => {
    const variants = {
        default: { bg: '#e5e7eb', color: 'black' },
        success: { bg: '#86efac', color: 'black' },
        warning: { bg: '#fef08a', color: 'black' },
        info: { bg: '#bfdbfe', color: 'black' },
        danger: { bg: '#fca5a5', color: 'black' }
    };

    const { bg, color } = variants[variant] || variants.default;

    return (
        <span style={{
            background: bg,
            color: color,
            padding: '5px 10px',
            border: '2px solid black',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            ...style
        }}>
            {children}
        </span>
    );
};
