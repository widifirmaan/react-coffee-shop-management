import React from 'react';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', style = {}, disabled = false, ...props }) => {
    const baseStyle = {
        padding: '15px 30px',
        fontSize: '1.2rem',
        fontWeight: '900',
        border: '3px solid black',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.1s',
        opacity: disabled ? 0.6 : 1,
        ...style
    };

    const variants = {
        primary: { background: 'black', color: 'white', boxShadow: '4px 4px 0 0 rgba(0,0,0,0.2)' },
        secondary: { background: 'white', color: 'black', boxShadow: '4px 4px 0 0 black' },
        danger: { background: '#ef4444', color: 'white', boxShadow: '4px 4px 0 0 black' },
        success: { background: '#22c55e', color: 'black', boxShadow: '4px 4px 0 0 black' },
        accent: { background: '#FCD34D', color: 'black', boxShadow: '4px 4px 0 0 black' }
    };

    const activeStyle = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${className}`}
            style={{ ...baseStyle, ...activeStyle }}
            onMouseEnter={e => !disabled && (e.currentTarget.style.transform = 'translate(-2px, -2px)', e.currentTarget.style.boxShadow = '6px 6px 0 0 black')}
            onMouseLeave={e => !disabled && (e.currentTarget.style.transform = 'translate(0, 0)', e.currentTarget.style.boxShadow = activeStyle.boxShadow)}
            onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'translate(2px, 2px)', e.currentTarget.style.boxShadow = '2px 2px 0 0 black')}
            onMouseUp={e => !disabled && (e.currentTarget.style.transform = 'translate(-2px, -2px)', e.currentTarget.style.boxShadow = '6px 6px 0 0 black')}
            {...props}
        >
            {children}
        </button>
    );
};
