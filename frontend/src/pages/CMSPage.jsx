import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, Coffee, Zap, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageModal from '../components/ui/ImageModal';
import MenuDetailModal from '../components/ui/MenuDetailModal';
import CategorySelector from '../components/ui/CategorySelector';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- Background Components ---
const generateLetters = (count, startOffset = 0) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const words = ["COFFEE", "JAVA", "BREW", "CAFE", "LATTE"]; // Optional: mix full words? User said "huruf" (letters). Sticking to chars.
    return Array.from({ length: count }).map((_, i) => ({
        id: i + startOffset,
        char: chars[Math.floor(Math.random() * chars.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 12, // 8rem to 20rem (Large!)
        rotation: Math.random() * 360,
        depth: 0.01 + Math.random() * 0.04
    }));
};

const ParallaxBackground = ({ count, mousePos, color, startOffset = 0 }) => {
    const [letters] = useState(() => generateLetters(count, startOffset));

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {letters.map(l => (
                <div key={l.id} style={{
                    position: 'absolute',
                    left: `${l.x}%`,
                    top: `${l.y}%`,
                    fontSize: `${l.size}rem`,
                    lineHeight: 1,
                    fontWeight: '900',
                    fontFamily: 'Inter, sans-serif',
                    color: 'transparent',
                    WebkitTextStroke: `2px ${color}`,
                    transform: `translate(${(mousePos.x - window.innerWidth / 2) * l.depth}px, ${(mousePos.y - window.innerHeight / 2) * l.depth}px) rotate(${l.rotation}deg)`,
                    userSelect: 'none',
                    opacity: 0.8,
                    whiteSpace: 'nowrap'
                }}>
                    {l.char}
                </div>
            ))}
        </div>
    );
};

export default function CMSPage() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPromoOpen, setIsPromoOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [shopConfig, setShopConfig] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [detailImage, setDetailImage] = useState('');
    const [posts, setPosts] = useState([]);
    const [expandedImage, setExpandedImage] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuClick = (menu) => {
        setSelectedMenu(menu);
        setDetailImage(menu.imageUrl || 'https://via.placeholder.com/400x600?text=COFFEE');
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Fetch Menus and Config
    useEffect(() => {
        axios.get('/api/menus')
            .then(res => {
                setMenus(res.data.filter(m => m.available));
            })
            .catch(err => console.error(err));

        axios.get('/api/config')
            .then(res => {
                setShopConfig(res.data);
            })
            .catch(err => console.error(err));

        axios.get('/api/posts/published')
            .then(res => setPosts(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        // Desktop Wheel
        const handleWheel = (e) => {
            if (isMenuOpen || isInfoOpen) return;
            if (e.deltaY > 50) setIsPromoOpen(true);
            else if (e.deltaY < -50) setIsPromoOpen(false);
        };

        // Mobile Touch
        let touchStartY = 0;
        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchEnd = (e) => {
            if (isMenuOpen || isInfoOpen) return;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;

            if (deltaY > 50) setIsPromoOpen(true); // Swipe Up -> Open Promo
            else if (deltaY < -50) setIsPromoOpen(false); // Swipe Down -> Close Promo
        };

        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMenuOpen, isInfoOpen, isPromoOpen]);


    return (
        <div style={{
            background: '#FCD34D', // Yellow background for Info Layer
            color: '#000',
            minHeight: '100vh',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
        }}>
            {/* Styles & Keyframes */}
            <style>
                {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(2deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes marquee-reverse {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    @keyframes marquee-vertical {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(-50%); }
                    }
                    .marquee-container {
                        display: flex;
                        white-space: nowrap;
                        overflow: hidden;
                        border-top: 4px solid black;
                        border-bottom: 4px solid black;
                        background: #FCD34D;
                        padding: 15px 0;
                        position: relative;
                        z-index: 20; 
                    }
                    .marquee-content {
                        display: flex;
                        animation: marquee 10s linear infinite;
                    }
                    .marquee-item {
                        font-size: 2rem;
                    font-weight: 900;
                    margin-right: 50px;
                    text-transform: uppercase;
                    }
                    .hover-image-reveal {
                        opacity: 0;
                    transition: opacity 0.3s ease, transform 0.1s ease;
                    pointer-events: none;
                    position: fixed;
                    z-index: 50;
                    width: 250px;
                    height: 250px;
                    object-fit: cover;
                    border: 4px solid black;
                    transform: translate(-50%, -50%);
                    }
                    .menu-item:hover + .hover-image-reveal {
                        opacity: 1;
                    }
                    .menu-item {
                        font-size: 5rem;
                    font-weight: 900;
                    line-height: 1;
                    cursor: pointer;
                    transition: color 0.3s, transform 0.3s;
                    text-transform: uppercase;
                    mix-blend-mode: difference;
                    color: black;
                    display: block;
                    text-decoration: none;
                    background: none;
                    border: none;
                    padding: 0;
                    }
                    .menu-item:hover {
                        color: transparent;
                        -webkit-text-stroke: 2px black;
                        transform: scale(1.05);
                        font-style: italic;
                    }
                    @media (max-width: 768px) {
                        .menu-item {
                            font-size: 2.5rem;
                        }
                    }
                    @media (max-width: 1500px) {
                        .menu-item {
                            font-size: 3rem;
                        }
                    }
                    @media (max-width: 1300px) {
                        .sidebar-desktop {
                            display: none !important;
                        }
                    }
                    /* Promo Gate Animation */
                    .promo-gate-left.open {transform: translateX(-100%); }
                    .promo-gate-right.open {transform: translateX(100%); }

                    /* Gate Panels */
                    .gate-panel {
                        transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
                    background: white;
                    z-index: 10;
                    position: relative;
                    }
                    .gate-left.open {transform: translateX(-100%); }
                    .gate-right.open {transform: translateX(100%); }

                    /* Menu Overlay Slide Up */
                    .menu-overlay {
                        position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #111;
                    z-index: 1000;
                    transition: transform 0.6s cubic-bezier(0.85, 0, 0.15, 1);
                    transform: translateY(100%);
                    }
                    .menu-overlay.active {
                        transform: translateY(0);
                    }

                    /* Swiper Styling */
                    .swiper {width: 100%; padding-top: 50px; padding-bottom: 50px; }
                    .swiper-slide {
                        background-position: center;
                    background-size: cover;
                    width: 300px;
                    height: 450px;
                    background: #fff;
                    border: 4px solid white;
                    display: flex;
                    flex-direction: column;
                    }
                    .swiper-slide-shadow-left, .swiper-slide-shadow-right {
                        background-image: none !important; /* Remove default shadow gradient for cleaner look */
                    }
                    .menu-card-img {
                        width: 100%;
                    height: 300px;
                    object-fit: cover;
                    border-bottom: 4px solid black;
                    filter: grayscale(100%) contrast(1.2);
                    transition: filter 0.3s;
                    }
                    .swiper-slide-active .menu-card-img {
                        filter: grayscale(0%) contrast(1);
                    }
                    .menu-card-content {
                        padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    flex: 1;
                    background: #fff;
                    color: black;
                    }

                    @media (max-width: 768px) {
                        .menu - item {font - size: 3rem; }
                    .hero-title {font - size: 3rem; }
                    .gate-left.open {transform: translateY(-100%); }
                    .gate-right.open {transform: translateY(100%); }
                    .swiper-slide {width: 250px; height: 400px; }
                    }
                `}
            </style>

            {/* Scrolling Marquee TOP */}
            <div className="marquee-container">
                <div className="marquee-content">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="marquee-item">
                            {shopConfig?.marqueeText || 'SIAP NYAFE • FRESH BREW • GOOD VIBES • 24/7 OPEN •'}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', height: isMobile ? 'auto' : 'calc(100vh - 160px)', overflow: isMobile ? 'auto' : 'hidden' }}>

                {/* INFO LAYER (Background) */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, textAlign: 'center', padding: '20px'
                }}>
                    <div style={{ opacity: isInfoOpen ? 1 : 0, transition: 'opacity 0.5s 0.3s', transform: isInfoOpen ? 'scale(1)' : 'scale(0.9)' }}>
                        {/* Logo in Info */}
                        <div style={{
                            display: 'inline-block',
                            background: '#FCD34D',
                            color: 'black',
                            padding: '10px 25px',
                            fontSize: '2rem',
                            fontWeight: '900',
                            border: '4px solid black',
                            boxShadow: '6px 6px 0px black',
                            marginBottom: '40px',
                            transform: 'rotate(-3deg)'
                        }}>
                            {shopConfig?.shopName || 'SIAP NYAFE'}
                        </div>

                        <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px' }}>{shopConfig?.infoTitle || 'ABOUT US'}</h2>
                        <p style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6', fontWeight: 'bold', whiteSpace: 'pre-line' }}>
                            {shopConfig?.infoContent || 'We are not just a coffee shop. We are a movement.\nBorn in Jakarta, brewed for the bold.'}
                        </p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <div style={{ border: '4px solid black', padding: '20px', background: 'white' }}><h3 style={{ fontWeight: '900' }}>{shopConfig?.infoFooter1 || 'EST. 2024'}</h3></div>
                            <div style={{ border: '4px solid black', padding: '20px', background: 'white' }}><h3 style={{ fontWeight: '900' }}>{shopConfig?.infoFooter2 || 'JAKARTA'}</h3></div>
                        </div>
                        <button
                            onClick={() => setIsInfoOpen(false)}
                            style={{
                                marginTop: '50px', background: 'black', color: 'white', border: 'none', padding: '15px 30px',
                                fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '50px auto 0'
                            }}
                        >
                            <X /> CLOSE INFO
                        </button>
                    </div>
                </div>

                {/* FRONT LAYER (Split Grid) */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', height: '100%',
                    position: 'relative', zIndex: 10, pointerEvents: 'none'
                }}>
                    {/* Left Panel */}
                    <div className={`gate-panel gate-left ${isInfoOpen ? 'open' : ''}`} style={{
                        display: 'flex', flexDirection: 'column',
                        borderRight: '4px solid black', pointerEvents: 'auto',
                        backgroundColor: '#f8fafc', // Slate 50
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 'auto' // Remove forced height on mobile
                    }}>
                        {/* PARALLAX BACKGROUND LEFT */}
                        <ParallaxBackground count={15} mousePos={mousePos} color="#cbd5e1" />

                        {/* Abstract Artistic Blur */}
                        <div style={{
                            position: 'absolute', top: '-20%', left: '-20%', width: '80%', height: '80%',
                            background: 'radial-gradient(circle, rgba(252, 211, 77, 0.15) 0%, rgba(255,255,255,0) 60%)',
                            filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1
                        }} />

                        {/* Floating Logo Badge - Huge on Desktop (Static) */}
                        {!isMobile && (
                            <div style={{ position: 'absolute', top: '20%', right: '5%', zIndex: 10, transform: 'rotate(5deg)' }}>
                                <div style={{
                                    background: '#FCD34D',
                                    color: 'black',
                                    padding: '20px 40px',
                                    fontSize: 'clamp(2rem, 5vw, 5rem)', // 3x Bigger on desktop
                                    fontWeight: '900',
                                    border: '8px solid black', // Thicker border
                                    boxShadow: '12px 12px 0px black',
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1
                                }}>
                                    {shopConfig?.shopName || 'SIAP NYAFE'}
                                </div>
                            </div>
                        )}

                        <div style={{
                            height: '100%',
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: isMobile ? '30px 30px 20px 30px' : '40px', // Reduced padding on mobile
                            position: 'relative', zIndex: 5
                        }}>
                            {/* ... (Content remains same) ... */}
                            {/* Header Tech Specs */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontFamily: 'monospace',
                                fontSize: isMobile ? '0.75rem' : '1rem',
                                fontWeight: 'bold',
                                borderBottom: '2px solid black',
                                paddingBottom: isMobile ? '15px' : '20px'
                            }}>
                                <span>{shopConfig?.techSpec1 || '// EST 2024'}</span>
                                <span>{shopConfig?.techSpec2 || '// JKT_ID'}</span>
                                <span>{shopConfig?.techSpec3 || '// V.1.0'}</span>
                            </div>

                            {/* Main Big Type (Replaced by Illustration) */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: isMobile ? 'center' : 'flex-start' }}>
                                <img
                                    src={shopConfig?.heroImageUrl || "/illustration_hero.png?v=2"}
                                    alt="Coffee Illustration"
                                    style={{
                                        width: '100%',
                                        maxWidth: isMobile ? '200px' : '650px',
                                        height: 'auto',
                                        maxHeight: isMobile ? '15vh' : '45vh',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(10px 10px 0px rgba(0,0,0,0.1))',
                                        transform: 'rotate(-2deg)',
                                        marginBottom: isMobile ? '10px' : '20px',
                                        marginLeft: isMobile ? '0' : '-30px'
                                    }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                                />

                                <div style={{ marginTop: isMobile ? '5px' : '10px', borderLeft: '4px solid #FCD34D', paddingLeft: isMobile ? '12px' : '20px', width: '100%' }}>
                                    <p style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', fontWeight: 'bold', margin: 0, fontFamily: 'monospace' }}>
                                        BEANS STATUS: <span style={{ color: '#059669' }}>ONLINE</span>
                                    </p>
                                    <p style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', fontWeight: 'bold', margin: 0 }}>
                                        SERVING PREMIUM CAFFEINE
                                    </p>
                                </div>
                            </div>

                            {/* Action Area */}
                            {!isMobile && (
                                <div style={{ marginTop: '20px' }}>
                                    <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '25px', background: 'black', color: 'white',
                                        textDecoration: 'none', fontWeight: '900', fontSize: '1.5rem',
                                        border: '4px solid black', transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#FCD34D'; e.currentTarget.style.color = 'black'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white'; }}
                                    >
                                        <span>RESERVE_TABLE</span>
                                        <ArrowRight size={32} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className={`gate-panel gate-right ${isInfoOpen ? 'open' : ''}`} style={{
                        padding: isMobile ? '40px 40px 140px 40px' : '40px', // Standard padding
                        display: 'flex', flexDirection: 'column',
                        justifyContent: isMobile ? 'flex-start' : 'center', // Align to top on mobile
                        alignItems: 'flex-start',
                        pointerEvents: 'auto', borderLeft: '4px solid black',
                        backgroundColor: '#f8fafc', // Slate 50
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 'auto' // Remove forced height
                    }}>
                        {/* PARALLAX BACKGROUND RIGHT */}
                        <ParallaxBackground count={10} mousePos={mousePos} color="#cbd5e1" startOffset={50} />

                        {/* SIDEBAR GALLERY (Desktop Only) */}
                        {!isMobile && (
                            <div className="sidebar-desktop" style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                width: '280px',
                                height: '100%',
                                borderLeft: '4px solid black',
                                background: 'white',
                                overflow: 'hidden',
                                zIndex: 15
                            }}>
                                {/* Masking Gradients */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(to bottom, white, transparent)', zIndex: 2 }}></div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(to top, white, transparent)', zIndex: 2 }}></div>

                                {/* Scrolling Track */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    animation: 'marquee-vertical 20s linear infinite'
                                }}>
                                    {/* Double the array for seamless loop */}
                                    {[...(shopConfig?.galleryImages || []), ...(shopConfig?.galleryImages || [])].map((img, i) => (
                                        <div key={i} style={{ width: '100%', padding: '0', borderBottom: '4px solid black' }}>
                                            <img
                                                src={`${img}?auto=format&fit=crop&w=400&q=80`}
                                                alt="Cafe Vibe"
                                                onClick={() => setExpandedImage(img)}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    height: '280px',
                                                    objectFit: 'cover',
                                                    filter: 'grayscale(100%)',
                                                    cursor: 'pointer',
                                                    transition: 'filter 0.3s, transform 0.3s'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(100%)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* INFO */}
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setIsInfoOpen(true)} className="menu-item">INFO</button>
                            </div>

                            {/* MENU (Triggers Overlay) */}
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setIsMenuOpen(true)} className="menu-item">MENU</button>
                            </div>

                            {/* LATEST DROP trigger */}
                            <div className="menu-item-container" style={{ position: 'relative' }}>
                                <button onClick={() => setIsPromoOpen(true)} className="menu-item">
                                    LATEST DROP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MENU SHOWCASE OVERLAY (Slide Up) */}
            <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}>

                {/* Header Overlay - Fixed with Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    paddingTop: isMobile ? '30px' : '40px',
                    paddingBottom: '20px',
                    textAlign: 'center',
                    zIndex: 20,
                    background: '#111',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    userSelect: 'none'
                }}>
                    <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', color: 'white', margin: 0 }}>OUR SIGNATURES</h2>
                    <p style={{ color: '#FCD34D', fontSize: isMobile ? '1rem' : '1.2rem', letterSpacing: '2px', margin: '5px 0 0 0' }}>SWIPE TO EXPLORE</p>
                </div>

                <div style={{
                    position: 'absolute',
                    top: isMobile ? 'auto' : '40px',
                    bottom: isMobile ? '30px' : 'auto',
                    right: isMobile ? 'auto' : '40px',
                    left: isMobile ? '50%' : 'auto',
                    transform: isMobile ? 'translateX(-50%)' : 'none',
                    zIndex: 50
                }}>
                    <button onClick={() => setIsMenuOpen(false)} style={{
                        background: isMobile ? 'black' : 'transparent',
                        border: isMobile ? '2px solid white' : 'none',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: isMobile ? '50%' : '0',
                        padding: isMobile ? '15px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isMobile ? '0 4px 12px rgba(0,0,0,0.5)' : 'none'
                    }}>
                        <X size={isMobile ? 30 : 50} strokeWidth={3} />
                    </button>
                </div>

                <div style={{
                    width: '100%',
                    height: '100%',
                    padding: isMobile ? '130px 20px 100px 20px' : '180px 60px 100px 60px',
                    overflowY: 'auto'
                }}>
                    {/* Category Filter */}
                    {/* Category Filter */}
                    <CategorySelector
                        categories={['All', ...new Set(menus.map(m => m.category).filter(cat => cat !== 'Featured'))]}
                        activeCategory={activeCategory}
                        onSelect={setActiveCategory}
                        theme="dark"
                        layout="wrap"
                    />

                    {/* Menu Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
                        {(activeCategory === 'All' ? menus : menus.filter(m => m.category === activeCategory)).map(menu => (
                            <div key={menu.id} onClick={() => handleMenuClick(menu)} style={{
                                background: 'white', border: '4px solid white', cursor: 'pointer', overflow: 'hidden',
                                boxShadow: '8px 8px 0 0 rgba(255,255,255,0.3)', transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = '12px 12px 0 0 rgba(255,255,255,0.3)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; e.currentTarget.style.boxShadow = '8px 8px 0 0 rgba(255,255,255,0.3)'; }}>
                                <div style={{ height: '200px', overflow: 'hidden', borderBottom: '4px solid black' }}>
                                    <img src={menu.imageUrl || "https://placehold.co/600x400?text=No+Image"} alt={menu.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>{menu.name}</h3>
                                    <p style={{ opacity: 0.7, height: '40px', overflow: 'hidden', fontSize: '0.9rem', margin: '0 0 15px 0' }}>
                                        {menu.description || 'Delicious menu item'}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', background: '#FCD34D', padding: '8px 15px', border: '2px solid black', fontSize: '1.1rem' }}>
                                            Rp {menu.price?.toLocaleString()}
                                        </span>
                                        <div style={{ background: 'black', color: 'white', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {menu.category}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>

            {/* DETAIL MODAL */}
            <MenuDetailModal
                menu={selectedMenu}
                isOpen={!!selectedMenu}
                onClose={() => setSelectedMenu(null)}
                isMobile={isMobile}
                showAddToCart={false}
                showOrderButton={false}
                setExpandedImage={setExpandedImage}
            />

            {/* Mobile Sticky Action Button */}
            {isMobile && (
                <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" style={{
                    position: 'fixed', bottom: '40px', right: '20px', left: 'auto',
                    background: '#FCD34D', color: 'black',
                    padding: '15px 25px', border: '4px solid black',
                    boxShadow: '6px 6px 0 0 black',
                    textDecoration: 'none', fontWeight: '900', fontSize: '1.2rem',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    zIndex: 2000,
                    opacity: (isInfoOpen || isMenuOpen) ? 0 : 1,
                    pointerEvents: (isInfoOpen || isMenuOpen) ? 'none' : 'auto',
                    transition: 'opacity 0.3s'
                }}>
                    <span>RESERVE</span>
                    <ArrowRight size={20} />
                </a>
            )}

            {/* Sticker / Badge */}
            <div style={{
                position: 'fixed', bottom: '40px',
                right: isMobile ? 'auto' : '40px',
                left: isMobile ? '20px' : 'auto',
                width: isMobile ? 'auto' : '120px',
                height: isMobile ? 'auto' : '120px',
                padding: isMobile ? '15px 25px' : '0',
                background: isMobile ? '#FCD34D' : '#000',
                borderRadius: isMobile ? '0' : '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isMobile ? 'black' : 'white',
                fontWeight: '900',
                fontSize: isMobile ? '1.5rem' : '0.9rem',
                textAlign: 'center',
                transform: isMobile ? 'rotate(-5deg)' : 'rotate(-15deg)',
                border: isMobile ? '4px solid black' : '4px solid #fff',
                boxShadow: isMobile ? '8px 8px 0 0 black' : '0 0 0 4px #000',
                cursor: 'pointer',
                animation: isMobile ? 'none' : 'float 4s ease-in-out infinite reverse',
                zIndex: 100,
                opacity: (isInfoOpen || isMenuOpen) ? 0 : 1, transition: 'opacity 0.5s'
            }}>
                {isMobile ? (
                    <div style={{ lineHeight: 1, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                        {shopConfig?.shopName || 'SIAP NYAFE'}
                    </div>
                ) : (
                    <>{shopConfig?.badgeText1 || 'EST 2024'}<br />{shopConfig?.badgeText2 || 'JAKARTA'}</>
                )}
            </div>
            {/* Bottom Marquee (Checkerboard Pattern) */}
            <div className="marquee-container" style={{ position: 'relative', width: '100%', zIndex: 10, padding: 0, height: '50px', background: 'white', borderTop: '4px solid black', borderBottom: 'none' }}>
                <div className="marquee-content" style={{ animationName: 'marquee-reverse', animationDuration: '4s' }}>
                    {/* Repeat blocks to ensure seamless loop */}
                    {[...Array(20)].map((_, groupIndex) => (
                        <div key={groupIndex} style={{ display: 'flex' }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ width: '50px', height: '25px', background: i % 2 === 0 ? 'black' : 'white' }} />
                                    <div style={{ width: '50px', height: '25px', background: i % 2 === 0 ? 'white' : 'black' }} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* PROMO & NEWS SECTION (Fixed Overlay Gate) */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 200,
                background: '#FCD34D',
                transform: isPromoOpen ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.5s cubic-bezier(0.85, 0, 0.15, 1)'
            }}>

                {/* GATE LEFT */}
                <div className={`promo-gate-left ${isPromoOpen ? 'open' : ''}`} style={{
                    position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
                    background: 'black', color: 'white', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    borderRight: '2px solid white',
                    transition: 'transform 1s cubic-bezier(0.77, 0, 0.175, 1) 0.5s' // Delayed open
                }}>
                    <h2 style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: '900', marginRight: '40px', lineHeight: 0.8 }}>LATEST</h2>
                </div>

                {/* GATE RIGHT */}
                <div className={`promo-gate-right ${isPromoOpen ? 'open' : ''}`} style={{
                    position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
                    background: '#FCD34D', color: 'black', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                    borderLeft: '2px solid black',
                    transition: 'transform 1s cubic-bezier(0.77, 0, 0.175, 1) 0.5s' // Delayed open
                }}>
                    <h2 style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: '900', marginLeft: '40px', lineHeight: 0.8 }}>DROPS</h2>
                </div>

                {/* INNER CONTENT */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    width: '100%',
                    height: '100%', // Full height
                    opacity: isPromoOpen ? 1 : 0,
                    transition: 'opacity 0.5s 0.8s', // Delay fade in
                    overflowY: isMobile ? 'auto' : 'hidden' // Scrollable on mobile
                }}>
                    {/* Left Side: Title */}
                    <div style={{
                        flex: isMobile ? 'none' : '0 0 30%',
                        height: isMobile ? 'auto' : '100%',
                        minHeight: isMobile ? '120px' : 'auto',
                        borderRight: isMobile ? 'none' : '4px solid black',
                        borderBottom: isMobile ? '4px solid black' : 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: isMobile ? '20px' : '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: '#FCD34D' // Ensure background matches
                    }}>
                        <h2 style={{
                            fontSize: 'clamp(3rem, 8vw, 10rem)',
                            fontWeight: '900',
                            lineHeight: 0.8,
                            transform: isMobile ? 'none' : 'rotate(-90deg)',
                            whiteSpace: 'nowrap',
                            margin: 0,
                            textShadow: '8px 8px 0px white' // White shadow on yellow
                        }}>
                            LATEST DROPS
                        </h2>
                    </div>

                    {/* Right Side: Content Grid */}
                    <div style={{ flex: 1, padding: isMobile ? '20px' : '60px', background: '#fff', overflowY: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', paddingBottom: '100px' }}>

                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} style={{
                                        border: '4px solid black',
                                        padding: '30px',
                                        background: post.category === 'EVENT' ? '#FCD34D' : (post.category === 'PROMO' ? 'black' : 'white'),
                                        color: post.category === 'PROMO' ? 'white' : 'black',
                                        boxShadow: '15px 15px 0px black',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        display: 'flex', flexDirection: 'column'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translate(-5px, -5px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translate(0, 0)'}
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        <div style={{ background: post.category === 'PROMO' ? 'white' : 'black', color: post.category === 'PROMO' ? 'black' : 'white', display: 'inline-block', padding: '5px 15px', fontWeight: 'bold', marginBottom: '20px', fontSize: '0.9rem', alignSelf: 'flex-start' }}>{post.category}</div>
                                        {post.imageUrl && <img src={post.imageUrl} loading="lazy" style={{ width: '100%', height: '150px', objectFit: 'cover', border: '2px solid black', marginBottom: '15px' }} alt={post.title} />}
                                        <h3 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 0.9, marginBottom: '10px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{post.title}</h3>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '20px 0', lineHeight: 1.4, flex: 1, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{post.excerpt}</p>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: 'auto', borderTop: post.category === 'PROMO' ? '2px solid white' : '2px solid black', paddingTop: '10px', fontWeight: 'bold' }}>
                                            POSTED: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.5, fontWeight: 'bold', fontSize: '1.5rem', gridColumn: '1 / -1' }}>
                                    NO UPDATES YET. STAY TUNED.
                                </div>

                            )}

                        </div>

                        {/* View All Details Button */}

                    </div>
                </div>
            </div>

            {/* Blog Detail Modal */}
            {selectedPost && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    zIndex: 9999, background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedPost(null)}>
                    <div style={{
                        background: 'white', border: '5px solid black',
                        width: '100%', maxWidth: '900px', maxHeight: '90vh',
                        overflowY: 'auto', position: 'relative',
                        boxShadow: '15px 15px 0 0 black',
                        display: 'flex', flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Close Button */}
                        <button type="button" onClick={() => setSelectedPost(null)} style={{
                            position: 'absolute', top: '15px', right: '15px',
                            background: '#ef4444', color: 'white', border: '2px solid black',
                            width: '50px', height: '50px', cursor: 'pointer', zIndex: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '4px 4px 0 0 black',
                            transition: 'transform 0.1s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translate(2px, 2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translate(0, 0)'}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Image Header */}
                        {selectedPost.imageUrl && (
                            <div style={{ width: '100%', height: '350px', borderBottom: '5px solid black' }}>
                                <img src={selectedPost.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}

                        <div style={{ padding: isMobile ? '30px' : '50px' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px', marginBottom: '30px' }}>
                                <span style={{
                                    background: selectedPost.category === 'EVENT' ? '#FCD34D' : 'black',
                                    color: selectedPost.category === 'EVENT' ? 'black' : 'white',
                                    padding: '8px 20px', fontWeight: '900', fontSize: '1rem',
                                    border: '2px solid black'
                                }}>
                                    {selectedPost.category}
                                </span>
                                <span style={{ fontWeight: '900', fontSize: '1.2rem', opacity: 1, borderBottom: '4px solid black' }}>
                                    {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                            <h1 style={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: '900', lineHeight: 0.9, marginBottom: '40px', textTransform: 'uppercase', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {selectedPost.title}
                            </h1>

                            <div style={{
                                fontSize: '1.2rem',
                                lineHeight: '1.8',
                                fontFamily: "'Courier New', Courier, monospace",
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                borderLeft: '4px solid #ddd',
                                paddingLeft: '20px'
                            }} dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }}>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expanded Image Modal */}
            <ImageModal
                imageUrl={expandedImage}
                onClose={() => setExpandedImage(null)}
                alt="Gallery Image"
            />
        </div >
    );
}
