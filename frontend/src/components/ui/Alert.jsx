import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Alert = ({ type = 'success', message, onClose, duration = 3000 }) => {

    useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!message) return null;

    const bgColors = {
        success: '#FCD34D', // Yellow (Branding)
        error: '#ef4444',   // Red
        info: '#3b82f6'     // Blue
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: '20px', right: '20px',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>
            <div style={{
                background: bgColors[type] || 'white',
                border: '4px solid black',
                padding: '20px 40px',
                boxShadow: '8px 8px 0 0 black',
                minWidth: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px'
            }}>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>
                        {type === 'error' ? 'ERROR!' : 'SUCCESS!'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {message}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '2rem',
                            fontWeight: '900',
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                )}
            </div>
        </div>,
        document.body
    );
};
