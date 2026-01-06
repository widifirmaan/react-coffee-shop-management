import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Send, Menu as MenuIcon, Bell, MapPin, Phone, Instagram, Facebook, CreditCard, HelpCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './OrderPage.css'; // Create this for custom swiper styles if needed
export default function OrderPage() {
    const [menus, setMenus] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', tableNumber: '' });
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null); // { type: 'success' | 'error', message: '' }
    const [enlargedImage, setEnlargedImage] = useState(null);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            // Show only available menus to customers
            setMenus(res.data.filter(m => m.available));
        } catch (error) {
            console.error("Failed to fetch menus", error);
        }
    };

    const categories = ['All', ...new Set(menus.map(m => m.category).filter(cat => cat !== 'Featured'))];

    const filteredMenus = activeCategory === 'All'
        ? menus
        : menus.filter(m => m.category === activeCategory);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) {
                const newQ = i.quantity + delta;
                return newQ > 0 ? { ...i, quantity: newQ } : i;
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const openCheckout = () => {
        if (cart.length === 0) return;
        setIsCheckoutOpen(true);
        setIsCartOpen(false); // Close cart detail if open
    };

    const handleConfirmStep = (e) => {
        e.preventDefault();
        setIsCheckoutOpen(false);
        setIsConfirmOpen(true);
    };

    const processOrder = async () => {
        try {
            const orderPayload = {
                items: cart.map(i => ({ menuId: i.id, menuName: i.name, quantity: i.quantity, price: i.price })),
                totalAmount: total,
                tableNumber: customerInfo.tableNumber,
                customerName: customerInfo.name
            };
            await axios.post('/api/orders', orderPayload);
            setAlertMsg({ type: 'success', message: 'ORDER PLACED SUCCESSFULLY!' });
            // Manual dismiss required as per request
            setCart([]);
            setIsConfirmOpen(false);
            setCustomerInfo({ name: '', tableNumber: '' });
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'ORDER FAILED. PLEASE TRY AGAIN.' });
        }
    };





    const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);

    // Grouping logic for "All" view
    const groupedMenus = filteredMenus.reduce((acc, menu) => {
        const cat = menu.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(menu);
        return acc;
    }, {});

    const handleCallWaiter = () => {
        setIsCallWaiterOpen(true);
    };

    const sendWaitorNotification = (type) => {
        // Here you would send backend request with type ('PAYMENT' or 'HELP')
        setAlertMsg({ type: 'success', message: type === 'PAYMENT' ? 'WAITER NOTIFIED FOR PAYMENT!' : 'WAITER NOTIFIED FOR HELP!' });
        setIsCallWaiterOpen(false);
    }


    return (
        <div style={{ padding: '0', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
            {/* Sticky Header */}
            <div style={{ backgroundColor: 'white', borderBottom: '4px solid black', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
                <div className="navbar-brand">SIAP NYAFE</div>
                <button onClick={handleCallWaiter} className="danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '10px 15px' }}>
                    <Bell size={18} /> CALL WAITER
                </button>
            </div>

            <div style={{ padding: '20px', flex: 1 }}>
                {/* Custom Brutalist Alert */}
                {alertMsg && (
                    <div className={`brutalist-alert ${alertMsg.type}`} style={{ marginBottom: '20px' }}>
                        {alertMsg.type === 'success' ? '✅' : '⚠️'}
                        <div>{alertMsg.message}</div>
                        <button onClick={() => setAlertMsg(null)} style={{ marginTop: '10px', width: '100%' }}>CLOSE</button>
                    </div>
                )}

                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>DAFTAR MENU</h1>
                    <p className="user-greeting" style={{ display: 'inline-block' }}>
                        {customerInfo.name ? `Ordering for: ${customerInfo.name} | Table: ${customerInfo.tableNumber}` : 'WELCOME! PLEASE SELECT YOUR ITEMS.'}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'stretch', marginBottom: '40px' }}>
                        {/* Featured Menu Section */}
                        {(() => {
                            const featuredItems = menus.filter(m => m.category === 'Featured');

                            return featuredItems.length > 0 && (
                                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
                                    <h2 style={{ fontSize: '1.5rem', borderBottom: '4px solid black', display: 'inline-block', marginBottom: '20px' }}>🔥 FEATURED TODAY</h2>
                                    <div
                                        className="card menu-card"
                                        style={{ flex: 1, cursor: 'pointer', border: '4px solid black', boxShadow: '8px 8px 0 0 black' }}
                                        onClick={() => setSelectedMenu(featuredItems[0])}
                                    >
                                        <div style={{ position: 'relative', height: '250px', overflow: 'hidden', borderBottom: '4px solid black' }}>
                                            <img
                                                src={featuredItems[0].imageUrl || "https://placehold.co/600x400/e0e0e0/000000?text=No+Image"}
                                                alt={featuredItems[0].name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div style={{ position: 'absolute', top: 10, left: 10, background: '#FCD34D', padding: '5px 10px', fontWeight: 900, border: '2px solid black' }}>
                                                FEATURED
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.8rem' }}>{featuredItems[0].name}</h3>
                                                <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: 1.5 }}>{featuredItems[0].description}</p>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                                <span className="badge" style={{ fontSize: '1.2rem' }}>Rp {featuredItems[0].price.toLocaleString()}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart(featuredItems[0]); }}
                                                    className="success"
                                                    style={{ padding: '10px 20px', fontSize: '1rem' }}
                                                >
                                                    ADD +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}


                        {/* Category Swiper Section */}
                        <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.5rem', borderBottom: '4px solid black', display: 'inline-block', marginBottom: '20px' }}>📖 BROWSE CATEGORIES</h2>
                            <Swiper
                                effect={'coverflow'}
                                grabCursor={true}
                                centeredSlides={true}
                                slidesPerView={'auto'}
                                slideToClickedSlide={true}
                                coverflowEffect={{
                                    rotate: 50,
                                    stretch: 0,
                                    depth: 100,
                                    modifier: 1,
                                    slideShadows: false,
                                }}
                                pagination={true}
                                modules={[EffectCoverflow, Pagination]}
                                className="mySwiper"
                                style={{ flex: 1, width: '100%' }}
                                onSlideChange={(swiper) => setActiveCategory(categories[swiper.activeIndex])}
                                initialSlide={categories.indexOf(activeCategory) !== -1 ? categories.indexOf(activeCategory) : 0}
                            >
                                {categories.map((cat, index) => (
                                    <SwiperSlide key={cat} onClick={() => setActiveCategory(cat)}>
                                        <div className="category-label">
                                            {cat}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                                Selected: <span style={{ background: 'black', color: 'white', padding: '2px 8px' }}>{activeCategory}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {Object.entries(groupedMenus).map(([category, items]) => (
                    <div key={category} className="category-group" style={{ marginBottom: '40px' }}>
                        <h2 className="category-title" style={{ fontSize: '2rem', borderBottom: '4px solid black', display: 'inline-block', marginBottom: '20px', paddingRight: '20px' }}>{category}</h2>
                        <div className="grid">
                            {items.map(menu => (
                                <div
                                    key={menu.id}
                                    className="card menu-card"
                                    onClick={() => setSelectedMenu(menu)}
                                    style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                >
                                    {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} className="menu-image" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />}
                                    <div style={{ padding: '15px' }}>
                                        <h3>{menu.name}</h3>
                                        <p style={{ opacity: 0.7, fontSize: '0.9rem', minHeight: '40px' }}>{menu.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                            <span className="badge">Rp {menu.price.toLocaleString()}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(menu); }}
                                                className="success"
                                                style={{ padding: '8px 15px' }}
                                            >
                                                ADD +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ borderTop: '4px solid black', marginTop: '60px', padding: '40px 20px', backgroundColor: 'white', marginLeft: '-20px', marginRight: '-20px', marginBottom: '-20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>SIAP NYAFE</h3>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
                                <MapPin size={20} /> Jl. Kopi Nikmat No. 1, Jakarta Selatan
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
                                <Phone size={20} /> +62 812-3456-7890
                            </p>
                        </div>

                        <div style={{ flex: '1 1 300px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>FOLLOW US</h3>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <a href="#" className="social-icon">
                                    <Instagram size={24} />
                                </a>
                                <a href="#" className="social-icon">
                                    <Facebook size={24} />
                                </a>
                            </div>
                        </div>

                        <div style={{ flex: '1 1 300px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>KRITIK & SARAN</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setAlertMsg({ type: 'success', message: 'TERIMA KASIH ATAS MASUKAN ANDA!' });
                                e.target.reset();
                            }} style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                                <input
                                    required
                                    placeholder="Tulis masukan Anda disini..."
                                    style={{
                                        flex: 1,
                                        height: '50px',
                                        padding: '10px',
                                        border: '2px solid black',
                                        minWidth: 0,
                                        fontFamily: 'inherit',
                                        background: '#fff',
                                        boxShadow: '4px 4px 0 0 #e0e0e0',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button type="submit" className="primary" style={{ height: '50px', padding: '0 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '4px 4px 0 0 black', boxSizing: 'border-box' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '2px dashed black', opacity: 0.8, fontSize: '0.9rem', fontWeight: 'bold' }}>
                        &copy; {new Date().getFullYear()} SIAP NYAFE. ALL RIGHTS RESERVED.
                    </div>
                </div>

                {cart.length > 0 && (
                    <div className="floating-cart">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                            <div style={{ background: 'black', color: 'white', padding: '10px', border: '2px solid black' }}>
                                <ShoppingCart />
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>Rp {total.toLocaleString()}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{cart.length} ITEMS (CLICK TO EDIT)</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="primary" onClick={openCheckout} style={{ padding: '10px 30px' }}>
                                <Send size={18} /> ORDER NOW
                            </button>
                        </div>
                    </div>
                )}

                {isCartOpen && (
                    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2>YOUR ORDER</h2>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '2px solid black' }}>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{item.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem' }}>Rp {item.price.toLocaleString()}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '5px' }}><Minus size={14} /></button>
                                            <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '5px' }}><Plus size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                                <span>TOTAL:</span>
                                <span>Rp {total.toLocaleString()}</span>
                            </div>
                            <button className="primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setIsCartOpen(false)}>CLOSE</button>
                        </div>
                    </div>
                )}
                {isCheckoutOpen && (
                    <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2>CHECKOUT</h2>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: 'bold' }}>Total Items: {cart.length}</div>
                                <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>Total: Rp {total.toLocaleString()}</div>
                            </div>
                            <form onSubmit={handleConfirmStep}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontWeight: 900 }}>YOUR NAME</label>
                                    <input
                                        required
                                        value={customerInfo.name}
                                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        placeholder="Enter your name"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ fontWeight: 900 }}>TABLE NUMBER</label>
                                    <select
                                        required
                                        value={customerInfo.tableNumber}
                                        onChange={e => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            border: '4px solid black',
                                            borderRadius: '0',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            background: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" disabled>SELECT TABLE</option>
                                        {Array.from({ length: 20 }, (_, i) => `T${i + 1}`).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setIsCheckoutOpen(false)} style={{ flex: 1, background: '#fff' }}>CANCEL</button>
                                    <button type="submit" className="primary" style={{ flex: 1 }}>CONFIRM ORDER</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {selectedMenu && (
                    <div className="modal-overlay" onClick={() => setSelectedMenu(null)} style={{ alignItems: 'flex-start', paddingTop: '30px' }}>
                        <div className="modal-content animated-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ position: 'relative', marginBottom: '20px' }}>
                                {(() => {
                                    const gallery = selectedMenu.gallery && selectedMenu.gallery.length > 0
                                        ? selectedMenu.gallery
                                        : (selectedMenu.imageUrl ? [selectedMenu.imageUrl, '', '', ''] : ['', '', '', '']);

                                    const displayImages = [...gallery];
                                    while (displayImages.length < 4) displayImages.push('');

                                    return (
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            {/* Main Image */}
                                            <div
                                                style={{ flex: 2, border: '4px solid black', background: '#e0e0e0', height: '400px', cursor: 'pointer', position: 'relative' }}
                                                onClick={() => displayImages[0] && setEnlargedImage(displayImages[0])}
                                            >
                                                {displayImages[0] ? (
                                                    <img
                                                        src={displayImages[0]}
                                                        alt={selectedMenu.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.3, fontWeight: 'bold' }}>NO IMAGE</div>
                                                )}
                                            </div>

                                            {/* Thumbnail Column */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[1, 2, 3].map(idx => (
                                                    <div
                                                        key={idx}
                                                        style={{ border: '4px solid black', background: '#e0e0e0', height: 'calc((400px - 30px) / 3)', cursor: displayImages[idx] ? 'pointer' : 'default', position: 'relative' }}
                                                        onClick={() => displayImages[idx] && setEnlargedImage(displayImages[idx])}
                                                    >
                                                        {displayImages[idx] ? (
                                                            <img
                                                                src={displayImages[idx]}
                                                                alt={`${selectedMenu.name} ${idx + 1}`}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.2, fontSize: '0.8rem', fontWeight: 'bold' }}>EMPTY</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <button
                                    onClick={() => setSelectedMenu(null)}
                                    style={{ position: 'absolute', top: -20, right: -20, background: '#EF4444', color: 'white', border: '4px solid black', width: '50px', height: '50px', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '4px 4px 0 0 black' }}
                                >X</button>
                            </div>

                            <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{selectedMenu.name}</h2>
                            <div className="badge" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '1.2rem', background: '#FCD34D' }}>
                                Rp {selectedMenu.price.toLocaleString()}
                            </div>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px', opacity: 0.9 }}>{selectedMenu.description}</p>

                            <button
                                className="success"
                                style={{ width: '100%', fontSize: '1.2rem', padding: '15px' }}
                                onClick={() => {
                                    addToCart(selectedMenu);
                                    setAlertMsg({ type: 'success', message: 'ADDED TO CART!' });
                                    setSelectedMenu(null);
                                }}
                            >
                                ADD TO CART +
                            </button>
                        </div>
                    </div>
                )}

                {isCallWaiterOpen && (
                    <div className="modal-overlay" onClick={() => setIsCallWaiterOpen(false)}>
                        <div className="modal-content animated-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>HOW CAN WE HELP?</h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <button
                                    className="primary"
                                    onClick={() => sendWaitorNotification('PAYMENT')}
                                    style={{ padding: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
                                >
                                    <CreditCard size={30} /> ASK FOR BILL / PAYMENT
                                </button>
                                <button
                                    style={{ padding: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', background: 'white', border: '4px solid black', fontWeight: '900', cursor: 'pointer', boxShadow: '4px 4px 0 0 black' }}
                                    onClick={() => sendWaitorNotification('HELP')}
                                >
                                    <HelpCircle size={30} /> NEED ASSISTANCE
                                </button>
                            </div>
                            <button onClick={() => setIsCallWaiterOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#e0e0e0', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                )}

                {isConfirmOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ textAlign: 'center' }}>
                            <h2>ARE YOU SURE?</h2>
                            <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>
                                Order for <strong>{customerInfo.name}</strong> at Table <strong>{customerInfo.tableNumber}</strong>?
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setIsConfirmOpen(false)} style={{ flex: 1, background: '#fff' }}>CANCEL</button>
                                <button className="primary" onClick={processOrder} style={{ flex: 1 }}>YES, ORDER!</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Background Image Style Body similar to Dashboard */}
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(/person-coffee.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1,
                    opacity: 0.15,
                    pointerEvents: 'none'
                }}></div>

                {/* Enlarged Image Modal */}
                {enlargedImage && (
                    <div
                        className="modal-overlay"
                        onClick={() => setEnlargedImage(null)}
                        style={{ zIndex: 4000, background: 'rgba(0,0,0,0.9)' }}
                    >
                        <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                            <img
                                src={enlargedImage}
                                alt="Enlarged"
                                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', border: '4px solid black' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                            />
                            <button
                                onClick={() => setEnlargedImage(null)}
                                style={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    background: '#EF4444',
                                    color: 'white',
                                    border: '4px solid black',
                                    width: '50px',
                                    height: '50px',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    boxShadow: '4px 4px 0 0 black'
                                }}
                            >
                                X
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
