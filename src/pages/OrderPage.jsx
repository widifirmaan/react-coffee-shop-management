import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Menu as MenuIcon, LayoutGrid, List as ListIcon, Trash2, Plus, Minus } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import ImageModal from '../components/ui/ImageModal';
import MenuDetailModal from '../components/ui/MenuDetailModal';
import CategorySelector from '../components/ui/CategorySelector';
import OrderPageHeader from '../components/layout/OrderPageHeader';
import OrderPageFooter from '../components/layout/OrderPageFooter';
import './OrderPage.css';

export default function OrderPage({ shopConfig }) {
    const [menus, setMenus] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', tableNumber: '', notes: '', paymentMethod: 'CASH' });
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        fetchMenus();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            setMenus(res.data.filter(m => m.available));
        } catch (error) {
            console.error("Failed to fetch menus", error);
        }
    };

    const categories = ['All', ...new Set(menus.map(m => m.category).filter(cat => cat !== 'Featured'))];
    const filteredMenus = activeCategory === 'All' ? menus : menus.filter(m => m.category === activeCategory);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...item, quantity: 1 }];
        });
        setAlertMsg({ type: 'success', message: 'ADDED TO CART!' });
        setTimeout(() => setAlertMsg(null), 2000);
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) {
                const newQ = i.quantity + delta;
                return { ...i, quantity: newQ };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const processOrder = async () => {
        try {
            const orderPayload = {
                items: cart.map(i => ({ menuId: i.id, menuName: i.name, quantity: i.quantity, price: i.price })),
                totalAmount: total,
                tableNumber: customerInfo.tableNumber,
                customerName: customerInfo.name,
                notes: customerInfo.notes,
                paymentMethod: customerInfo.paymentMethod
            };
            await axios.post('/api/orders', orderPayload);
            setAlertMsg({ type: 'success', message: 'ORDER PLACED SUCCESSFULLY!' });
            setCart([]);
            setIsConfirmOpen(false);
            setCustomerInfo({ name: '', tableNumber: '', notes: '', paymentMethod: 'CASH' });
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'ORDER FAILED. PLEASE TRY AGAIN.' });
        }
    };

    // Group logic for "All" view
    const groupedMenus = filteredMenus.reduce((acc, menu) => {
        const cat = menu.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(menu);
        return acc;
    }, {});

    const renderGallery = (menu) => {
        const gallery = menu.gallery && menu.gallery.length > 0 ? menu.gallery : (menu.imageUrl ? [menu.imageUrl] : []);
        const uniqueImages = [...new Set(gallery)].filter(Boolean);

        if (!uniqueImages.length) return <div style={{ height: '300px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid black' }}>NO IMAGE</div>;

        return (
            <div style={{ display: 'grid', gap: '10px' }}>
                <img onClick={() => setZoomedImage(uniqueImages[0])} src={uniqueImages[0]} style={{ width: '100%', height: '300px', objectFit: 'cover', border: '4px solid black', cursor: 'zoom-in' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    {uniqueImages.slice(1, 4).map((img, i) => (
                        <img key={i} onClick={() => setZoomedImage(img)} src={img} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid black', cursor: 'zoom-in' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                    ))}
                </div>
            </div>
        );
    };

    const handleCallWaiter = async (type) => {
        if (!customerInfo.tableNumber) {
            setAlertMsg({ type: 'error', message: 'PLEASE SELECT TABLE NUMBER' });
            return;
        }
        try {
            await axios.post('/api/notifications', {
                type: 'CALL_WAITER',
                message: type === 'PAYMENT' ? 'Customer requesting bill/payment' : 'Customer requesting assistance',
                tableNumber: customerInfo.tableNumber
            });
            setAlertMsg({ type: 'success', message: 'WAITER NOTIFIED!' });
            setIsCallWaiterOpen(false);
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO CALL WAITER' });
        }
    };

    return (
        <div style={{ paddingBottom: '0' }}>
            {/* Header */}
            <OrderPageHeader shopConfig={shopConfig} onCallWaiter={() => setIsCallWaiterOpen(true)} />

            <div style={{
                minHeight: '100vh',
                width: '100%',
                backgroundImage: 'url(/bg-menu-color.png)',
                backgroundSize: '300px',
                backgroundRepeat: 'repeat',
                backgroundAttachment: 'fixed'
            }}>
                <div style={{
                    padding: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    minHeight: '100vh'
                }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '40px',
                        backgroundColor: 'white',
                        border: '4px solid black',
                        boxShadow: '10px 10px 0 0 black',
                        padding: '30px'
                    }}>
                        <h1 className="page-title" style={{ margin: '10px 0' }}>DAFTAR MENU</h1>
                        <p style={{ fontWeight: 'bold' }}>{customerInfo.name ? `Ordering for: ${customerInfo.name}` : 'WELCOME! PLEASE SELECT YOUR ITEMS.'}</p>

                        {/* Category Selector */}
                        <CategorySelector
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelect={setActiveCategory}
                            theme="light"
                            layout="scroll"
                        />
                    </div>

                    {/* Menu Grid */}
                    {Object.entries(groupedMenus).map(([category, items]) => (
                        <div key={category} style={{ marginBottom: '50px' }}>
                            <h2 className="category-header" style={{ borderBottom: '4px solid black', display: 'inline-block', marginBottom: '20px', background: 'black', color: 'white', padding: '5px 20px', transform: 'rotate(-1deg)' }}>{category}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                                {items.map(menu => (
                                    <Card key={menu.id} onClick={() => setSelectedMenu(menu)} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
                                        <div style={{ height: '200px', overflow: 'hidden', borderBottom: '4px solid black' }}>
                                            <img src={menu.imageUrl || "https://placehold.co/600x400?text=No+Image"} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-zoom" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <h3 className="menu-item-title" style={{
                                                margin: '0 0 10px 0',
                                                lineHeight: 1.2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '2.4em'
                                            }}>{menu.name}</h3>
                                            <p style={{ opacity: 0.7, height: '40px', overflow: 'hidden', fontSize: '0.9rem' }}>{menu.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                                <span style={{ fontWeight: 'bold', background: '#eee', padding: '5px 10px', border: '2px solid black' }}>Rp {menu.price?.toLocaleString()}</span>
                                                <Button variant="success" onClick={(e) => { e.stopPropagation(); addToCart(menu); }} style={{ padding: '5px 15px' }}>ADD +</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* Footer Info */}
            <OrderPageFooter shopConfig={shopConfig} />

            {/* Floating Cart */}
            {
                cart.length > 0 && (
                    <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'white', border: '4px solid black', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 50, boxShadow: '8px 8px 0 0 black' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={24} />
                            <div>
                                <div style={{ fontWeight: '900' }}>Rp {total.toLocaleString()}</div>
                                <div style={{ fontSize: '0.8rem' }}>{cart.length} ITEMS</div>
                            </div>
                        </div>
                        <Button onClick={() => { setIsCheckoutOpen(true); setIsCartOpen(false); }} variant="primary">ORDER NOW</Button>
                    </div>
                )
            }

            {/* Modals */}
            <MenuDetailModal
                menu={selectedMenu}
                isOpen={!!selectedMenu}
                onClose={() => setSelectedMenu(null)}
                isMobile={isMobile}
                showAddToCart={true}
                onAddToCart={addToCart}
                setExpandedImage={setZoomedImage}
            />

            <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="YOUR ORDER">
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '2px solid black' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>{item.name}</h4>
                                <p>Rp {item.price.toLocaleString()}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Button variant="secondary" onClick={() => updateQuantity(item.id, -1)} style={{ padding: '5px' }}><Minus size={16} /></Button>
                                <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>{item.quantity}</span>
                                <Button variant="secondary" onClick={() => updateQuantity(item.id, 1)} style={{ padding: '5px' }}><Plus size={16} /></Button>
                                <Button variant="danger" onClick={() => updateQuantity(item.id, -item.quantity)} style={{ padding: '5px', marginLeft: '10px' }}><Trash2 size={16} /></Button>
                            </div>

                        </div>
                    ))}
                    <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '1.5rem', fontWeight: '900' }}>TOTAL: Rp {total.toLocaleString()}</div>
                    <Button variant="primary" onClick={() => setIsCartOpen(false)} style={{ width: '100%', marginTop: '20px' }}>CLOSE</Button>
                </div>
            </Modal >

            <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="CHECKOUT">
                <form onSubmit={(e) => { e.preventDefault(); setIsCheckoutOpen(false); setIsConfirmOpen(true); }}>
                    <Input label="YOUR NAME" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} required />
                    <Select label="TABLE NUMBER" value={customerInfo.tableNumber} onChange={e => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                        options={[{ value: 'Take Away', label: 'Take Away' }, ...[...Array(20)].map((_, i) => ({ value: `Table ${i + 1}`, label: `Table ${i + 1}` }))]}
                    />
                    <Input label="NOTES" value={customerInfo.notes} onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })} type="textarea" />
                    <Select label="PAYMENT METHOD" value={customerInfo.paymentMethod} onChange={e => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })}
                        options={['CASH', 'QRIS', 'DEBIT'].map(p => ({ value: p, label: p }))}
                    />
                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <Button variant="secondary" onClick={() => setIsCheckoutOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1 }}>CONFIRM</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="CONFIRM ORDER">
                <p style={{ fontSize: '1.2rem', textAlign: 'center' }}>Place order for <strong>{customerInfo.name}</strong>?</p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <Button variant="secondary" onClick={() => setIsConfirmOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                    <Button variant="primary" onClick={processOrder} style={{ flex: 1 }}>YES, ORDER!</Button>
                </div>
            </Modal>

            <Modal isOpen={isCallWaiterOpen} onClose={() => setIsCallWaiterOpen(false)} title="CALL WAITER">
                <div style={{ marginBottom: '20px' }}>
                    <Select
                        label="TABLE NUMBER"
                        value={customerInfo.tableNumber}
                        onChange={e => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                        options={[{ value: '', label: 'Select Table' }, ...[...Array(20)].map((_, i) => ({ value: `Table ${i + 1}`, label: `Table ${i + 1}` }))]}
                    />
                </div>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <Button variant="primary" onClick={() => handleCallWaiter('PAYMENT')}>PAYMENT / BILL</Button>
                    <Button variant="secondary" onClick={() => handleCallWaiter('GENERAL')}>GENERAL ASSISTANCE</Button>
                </div>
            </Modal>

            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}

            {/* Image Zoom Overlay */}
            <ImageModal
                imageUrl={zoomedImage}
                onClose={() => setZoomedImage(null)}
                alt="Menu Image"
            />
        </div >
    );
}
