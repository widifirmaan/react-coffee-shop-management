import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '800px' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: isOpen ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)',
                zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s'
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes modalPopUp {
                    from { opacity: 0; transform: scale(0.8) translateY(20px); }
                    to { opacity: 1; transform: none; }
                }
                @keyframes modalPopDown {
                    from { opacity: 1; transform: none; }
                    to { opacity: 0; transform: scale(0.8) translateY(20px); }
                }
            `}</style>
            <div
                style={{
                    background: 'white',
                    border: '4px solid black',
                    width: '100%',
                    maxWidth: maxWidth,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '10px 10px 0 0 black',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: isOpen
                        ? 'modalPopUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                        : 'modalPopDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px', borderBottom: '4px solid black', background: '#FCD34D'
                }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'black', color: 'white', border: 'none',
                            padding: '5px', cursor: 'pointer', display: 'flex'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>
                <div style={{ padding: '30px' }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
