import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImageModal({ imageUrl, onClose, alt = 'Expanded view' }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (imageUrl) {
            // Start opening animation
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10); // Small delay for CSS transition
        }
    }, [imageUrl]);

    const handleClose = () => {
        // Start closing animation
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300); // Match animation duration
    };

    if (!isVisible) return null;

    return (
        <>
            <style>
                {`
                    @keyframes imageModalFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes imageModalFadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                    @keyframes imageZoomIn {
                        from { 
                            transform: scale(0.7);
                            opacity: 0;
                        }
                        to { 
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                    @keyframes imageZoomOut {
                        from { 
                            transform: scale(1);
                            opacity: 1;
                        }
                        to { 
                            transform: scale(0.7);
                            opacity: 0;
                        }
                    }
                `}
            </style>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10000,
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    backdropFilter: 'blur(10px)',
                    animation: isAnimating
                        ? 'imageModalFadeIn 0.3s ease-out forwards'
                        : 'imageModalFadeOut 0.3s ease-out forwards'
                }}
                onClick={handleClose}
            >
                <div
                    style={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: isAnimating
                            ? 'imageZoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                            : 'imageZoomOut 0.3s ease-out forwards'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <img
                        src={`${imageUrl}?auto=format&fit=crop&w=1200&q=90`}
                        alt={alt}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            border: '6px solid white',
                            boxShadow: '0 0 40px rgba(0,0,0,0.8)'
                        }}
                    />
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            background: '#EF4444',
                            color: 'white',
                            border: '4px solid white',
                            width: '60px',
                            height: '60px',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </>
    );
}
