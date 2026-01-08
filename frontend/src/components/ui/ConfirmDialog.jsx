import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

export const ConfirmDialog = ({ isOpen, title = 'CONFIRM ACTION', message, onConfirm, onCancel, confirmText = 'YES', cancelText = 'NO', variant = 'danger' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: isOpen ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)',
                zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                backdropFilter: 'blur(2px)'
            }}
            onClick={onCancel}
        >
            <style>{`
                @keyframes confirmPop {
                    from { transform: scale(0.9) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes confirmPopExit {
                    from { transform: scale(1) translateY(0); opacity: 1; }
                    to { transform: scale(0.9) translateY(10px); opacity: 0; }
                }
            `}</style>
            <div
                style={{
                    background: 'white',
                    border: '4px solid black',
                    boxShadow: '12px 12px 0 0 black',
                    padding: '30px',
                    maxWidth: '450px',
                    width: '90%',
                    textAlign: 'center',
                    animation: isOpen
                        ? 'confirmPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                        : 'confirmPopExit 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 20px 0', textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {title}
                </h2>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '30px', fontFamily: 'monospace' }}>
                    {message}
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>{cancelText}</Button>
                    <Button variant={variant} onClick={onConfirm} style={{ flex: 1 }}>{confirmText}</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
