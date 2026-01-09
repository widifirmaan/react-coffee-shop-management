import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from './Modal';
import { Button } from './Button';

export default function MenuDetailModal({
    menu,
    isOpen,
    onClose,
    isMobile = false,
    showAddToCart = false,
    showOrderButton = true,
    onAddToCart,
    setExpandedImage
}) {
    if (!menu) return null;

    const renderGallery = () => {
        const gallery = menu.gallery && menu.gallery.length > 0 ? menu.gallery : (menu.imageUrl ? [menu.imageUrl] : []);
        const uniqueImages = [...new Set(gallery)].filter(Boolean);

        if (!uniqueImages.length) {
            return (
                <div style={{ height: '300px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid black' }}>
                    NO IMAGE
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gap: '15px' }}>
                <img
                    onClick={() => setExpandedImage && setExpandedImage(uniqueImages[0])}
                    src={uniqueImages[0]}
                    style={{ width: '100%', height: '350px', objectFit: 'cover', border: '4px solid black', cursor: 'zoom-in' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                />
                {uniqueImages.length > 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                        {uniqueImages.slice(1).map((img, i) => (
                            <img
                                key={i}
                                onClick={() => setExpandedImage && setExpandedImage(img)}
                                src={img}
                                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', border: '2px solid black', cursor: 'zoom-in' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={menu.name || 'DETAIL'} maxWidth="800px">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
                <div>{renderGallery()}</div>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Rp {menu.price?.toLocaleString()}</h2>
                    <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>{menu.description}</p>

                    {showAddToCart ? (
                        <Button
                            variant="success"
                            onClick={() => {
                                if (onAddToCart) onAddToCart(menu);
                                onClose();
                            }}
                            style={{ width: '100%', fontSize: '1.2rem', padding: '20px' }}
                        >
                            ADD TO CART
                        </Button>
                    ) : (
                        showOrderButton && (
                            <Link
                                to="/order"
                                style={{
                                    display: 'block',
                                    padding: '20px',
                                    background: 'black',
                                    color: 'white',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    fontWeight: '900',
                                    fontSize: '1.2rem',
                                    border: '4px solid black',
                                    boxShadow: '6px 6px 0 0 #FCD34D',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                    e.currentTarget.style.boxShadow = '8px 8px 0 0 #FCD34D';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translate(0, 0)';
                                    e.currentTarget.style.boxShadow = '6px 6px 0 0 #FCD34D';
                                }}
                            >
                                ORDER NOW →
                            </Link>
                        )
                    )}
                </div>
            </div>
        </Modal>
    );
}
