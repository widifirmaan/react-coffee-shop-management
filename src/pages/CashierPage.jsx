import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShoppingCart, CreditCard, DollarSign, QrCode, Printer,
    Plus, Minus, Trash2, CheckCircle2, RotateCcw, Search,
    Coffee, Utensils, X, User, Table as TableIcon, Tag, AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';

export default function CashierPage({ user, shopConfig }) {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('DINE_IN'); // DINE_IN or TAKEAWAY
    const [tableNumber, setTableNumber] = useState('1');
    const [customerName, setCustomerName] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [includeTax, setIncludeTax] = useState(true);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [cashTendered, setCashTendered] = useState(0);
    const [alertMsg, setAlertMsg] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Thermal Receipt Modal
    const [completedOrder, setCompletedOrder] = useState(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            const activeMenus = res.data.filter(m => m.available);
            setMenus(activeMenus);
            const cats = ['All', ...new Set(activeMenus.map(m => m.category).filter(Boolean))];
            setCategories(cats);
        } catch (e) {
            console.error('Failed to load menu items', e);
        }
    };

    const addToCart = (menu) => {
        setCart(prev => {
            const idx = prev.findIndex(item => item.id === menu.id);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx].quantity += 1;
                return updated;
            }
            return [...prev, {
                id: menu.id,
                name: menu.name,
                price: parseFloat(menu.price || 0),
                quantity: 1,
                notes: ''
            }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta;
                return { ...item, quantity: Math.max(0, newQ) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const updateItemNotes = (id, notes) => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
    };

    const removeItem = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        setDiscountAmount(0);
        setCashTendered(0);
        setCustomerName('');
        setOrderNotes('');
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxPercent = (shopConfig?.taxPercentage !== undefined && !isNaN(Number(shopConfig.taxPercentage)))
        ? Number(shopConfig.taxPercentage)
        : 10;
    const taxRate = taxPercent / 100;
    const taxAmount = includeTax ? Math.round(subtotal * taxRate) : 0;
    const validDiscount = Math.max(0, parseFloat(discountAmount || 0));
    const grandTotal = Math.max(0, subtotal + taxAmount - validDiscount);
    const changeAmount = Math.max(0, parseFloat(cashTendered || 0) - grandTotal);
    const isCashSufficient = paymentMethod !== 'CASH' || parseFloat(cashTendered || 0) >= grandTotal;

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const handleQuickCash = (amount) => {
        if (amount === 'EXACT') {
            setCashTendered(grandTotal);
        } else {
            setCashTendered(amount);
        }
    };

    const handleProcessOrder = async () => {
        if (processing) return;
        if (cart.length === 0) {
            setAlertMsg({ type: 'error', message: 'CART IS EMPTY! PLEASE ADD ITEMS.' });
            return;
        }

        if (paymentMethod === 'CASH' && parseFloat(cashTendered || 0) < grandTotal) {
            setAlertMsg({ type: 'error', message: 'CASH TENDERED IS LESS THAN TOTAL AMOUNT!' });
            return;
        }

        setProcessing(true);
        try {
            const orderPayload = {
                items: cart.map(item => ({
                    menuId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.notes
                })),
                totalPrice: subtotal,
                totalAmount: subtotal,
                tax: taxAmount,
                grandTotal: grandTotal,
                orderType: orderType,
                tableNumber: orderType === 'DINE_IN' ? tableNumber : 'TAKEAWAY',
                customerName: customerName || (orderType === 'DINE_IN' ? `Table ${tableNumber}` : 'Takeaway Customer'),
                paymentMethod: paymentMethod,
                paymentAmount: paymentMethod === 'CASH' ? parseFloat(cashTendered) : grandTotal,
                changeAmount: paymentMethod === 'CASH' ? changeAmount : 0,
                status: 'PREPARING', // Sent straight to Kitchen & Bar queue
                employeeId: user?.employeeId || '',
                shiftStaff: user?.name || user?.employeeId || 'Cashier',
                notes: orderNotes
            };

            const res = await axios.post('/api/orders', orderPayload);
            const savedOrder = res.data;

            setCompletedOrder(savedOrder);
            setIsReceiptOpen(true);
            clearCart();
            setAlertMsg({ type: 'success', message: `ORDER #${savedOrder.orderNumber} COMPLETED & SENT TO KITCHEN!` });
        } catch (e) {
            console.error('Order creation failed', e);
            const msg = e.response?.data?.message || 'FAILED TO PROCESS ORDER!';
            setAlertMsg({ type: 'error', message: msg });
        } finally {
            setProcessing(false);
        }
    };

    // Filter menu items
    const filteredMenus = menus.filter(m => {
        const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
        const matchesSearch = !searchQuery || (m.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const printReceipt = () => {
        window.print();
    };

    return (
        <div className="page-container" style={{ paddingTop: '30px', maxWidth: '1600px' }}>
            {/* Thermal Receipt Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .thermal-receipt-print-area, .thermal-receipt-print-area * {
                        visibility: visible;
                    }
                    .thermal-receipt-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        padding: 10px;
                        background: white;
                        color: black;
                        font-family: monospace;
                        font-size: 12px;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                @media (max-width: 1024px) {
                    .pos-split-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .pos-checkout-sidebar {
                        position: static !important;
                    }
                }
            `}</style>

            <Alert
                type={alertMsg?.type}
                message={alertMsg?.message}
                onClose={() => setAlertMsg(null)}
            />

            {/* POS HEADER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '20px',
                background: '#4ade80',
                border: '4px solid black',
                boxShadow: '6px 6px 0 0 black',
                padding: '15px 25px'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
                        CASHIER POS TERMINAL
                    </h1>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', opacity: 0.85, marginTop: '2px' }}>
                        OPERATOR: {user?.name || user?.employeeId || 'CASHIER'} • SHIFT POS ACTIVE
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                        background: 'black',
                        color: 'white',
                        padding: '6px 14px',
                        fontWeight: '900',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                    }}>
                        {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                </div>
            </div>

            {/* MAIN SPLIT POS LAYOUT */}
            <div className="pos-split-layout" style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)',
                gap: '20px',
                alignItems: 'start'
            }}>
                {/* LEFT: PRODUCT CATALOG */}
                <div>
                    {/* Search & Category Tabs */}
                    <div style={{
                        background: 'white',
                        border: '3px solid black',
                        boxShadow: '4px 4px 0 0 black',
                        padding: '15px',
                        marginBottom: '15px'
                    }}>
                        <div style={{ position: 'relative', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                            <Search
                                size={18}
                                strokeWidth={2.5}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'black',
                                    opacity: 0.6,
                                    pointerEvents: 'none'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="FAST SEARCH MENU (e.g. Latte, Croissant, Aglio)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    boxSizing: 'border-box',
                                    padding: searchQuery ? '0 38px 0 42px' : '0 14px 0 42px',
                                    border: '2px solid black',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    background: '#fafafa'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#666'
                                    }}
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Category Buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '8px 14px',
                                        border: '2px solid black',
                                        background: activeCategory === cat ? 'black' : '#f3f4f6',
                                        color: activeCategory === cat ? 'white' : 'black',
                                        fontWeight: '900',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s ease',
                                        boxShadow: activeCategory === cat ? '2px 2px 0 0 #f59e0b' : 'none'
                                    }}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid - Natural full-page scrolling without clipping */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '12px'
                    }}>
                        {filteredMenus.map(menu => {
                            const cartItem = cart.find(i => i.id === menu.id);
                            return (
                                <div
                                    key={menu.id}
                                    onClick={() => addToCart(menu)}
                                    style={{
                                        background: 'white',
                                        border: '3px solid black',
                                        boxShadow: cartItem ? '4px 4px 0 0 #10b981' : '3px 3px 0 0 black',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        userSelect: 'none',
                                        transition: 'transform 0.05s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '130px'
                                    }}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {cartItem && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            background: '#10b981',
                                            color: 'black',
                                            border: '2px solid black',
                                            borderRadius: '50%',
                                            width: '26px',
                                            height: '26px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '900',
                                            fontSize: '0.85rem'
                                        }}>
                                            {cartItem.quantity}
                                        </div>
                                    )}

                                    <div>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: '900',
                                            background: '#e0e7ff',
                                            border: '1px solid black',
                                            padding: '2px 5px'
                                        }}>
                                            {menu.category}
                                        </span>
                                        <div style={{
                                            fontWeight: '900',
                                            fontSize: '1rem',
                                            marginTop: '6px',
                                            lineHeight: 1.2
                                        }}>
                                            {menu.name}
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            fontFamily: 'monospace',
                                            fontWeight: '900',
                                            fontSize: '0.95rem',
                                            color: '#16a34a'
                                        }}>
                                            {formatRupiah(menu.price)}
                                        </div>
                                        <div style={{
                                            background: 'black',
                                            color: 'white',
                                            width: '26px',
                                            height: '26px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxSizing: 'border-box'
                                        }}>
                                            <Plus size={16} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: LIVE BILL & CASHIER CHECKOUT */}
                <div className="pos-checkout-sidebar" style={{
                    background: 'white',
                    border: '4px solid black',
                    boxShadow: '6px 6px 0 0 black',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    position: 'sticky',
                    top: '20px',
                    zIndex: 10
                }}>
                    {/* Order Mode & Table Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setOrderType('DINE_IN')}
                            style={{
                                padding: '10px',
                                border: '3px solid black',
                                background: orderType === 'DINE_IN' ? '#67e8f9' : '#f3f4f6',
                                fontWeight: '900',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <TableIcon size={16} /> DINE IN
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderType('TAKEAWAY')}
                            style={{
                                padding: '10px',
                                border: '3px solid black',
                                background: orderType === 'TAKEAWAY' ? '#fcd34d' : '#f3f4f6',
                                fontWeight: '900',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <ShoppingCart size={16} /> TAKEAWAY
                        </button>
                    </div>

                    {/* Table Number & Customer Name */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: orderType === 'DINE_IN' ? '1fr 2fr' : '1fr',
                        gap: '10px',
                        alignItems: 'end'
                    }}>
                        {orderType === 'DINE_IN' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', marginBottom: '4px' }}>TABLE #</label>
                                <select
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '42px',
                                        boxSizing: 'border-box',
                                        padding: '0 10px',
                                        border: '2px solid black',
                                        fontWeight: '900',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        outline: 'none'
                                    }}
                                >
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                                        <option key={n} value={String(n)}>Table {n}</option>
                                    ))}
                                    <option value="BAR-1">Bar 1</option>
                                    <option value="BAR-2">Bar 2</option>
                                    <option value="BAR-3">Bar 3</option>
                                    <option value="VIP-1">VIP Room 1</option>
                                    <option value="VIP-2">VIP Room 2</option>
                                    <option value="OUTDOOR-1">Outdoor 1</option>
                                    <option value="OUTDOOR-2">Outdoor 2</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', marginBottom: '4px' }}>CUSTOMER NAME</label>
                            <input
                                type="text"
                                placeholder="Walk-in Customer (Optional)"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    boxSizing: 'border-box',
                                    padding: '0 12px',
                                    border: '2px solid black',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div style={{
                        border: '2px solid black',
                        background: '#fafafa',
                        minHeight: '160px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        padding: '10px'
                    }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 10px', opacity: 0.5, fontWeight: 'bold' }}>
                                SELECT ITEMS TO START ORDER
                            </div>
                        ) : (
                            cart.map(item => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 0',
                                        borderBottom: '1px dashed #cbd5e1'
                                    }}
                                >
                                    <div style={{ flex: '1 1 auto', marginRight: '10px' }}>
                                        <div style={{ fontWeight: '900', fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7, fontFamily: 'monospace' }}>
                                            {formatRupiah(item.price)} × {item.quantity}
                                        </div>
                                    </div>

                                    {/* Qty Stepper */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, -1)}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                padding: 0,
                                                margin: 0,
                                                boxSizing: 'border-box',
                                                border: '2px solid black',
                                                background: '#fee2e2',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#000000'
                                            }}
                                            title="Decrease quantity"
                                        >
                                            <Minus size={15} strokeWidth={3} color="#000000" />
                                        </button>

                                        <span style={{ fontWeight: '900', fontFamily: 'monospace', minWidth: '22px', textAlign: 'center', fontSize: '0.9rem' }}>
                                            {item.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.id, 1)}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                padding: 0,
                                                margin: 0,
                                                boxSizing: 'border-box',
                                                border: '2px solid black',
                                                background: '#dcfce7',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#000000'
                                            }}
                                            title="Increase quantity"
                                        >
                                            <Plus size={15} strokeWidth={3} color="#000000" />
                                        </button>

                                        <div style={{ minWidth: '75px', textAlign: 'right', fontWeight: '900', fontFamily: 'monospace' }}>
                                            {formatRupiah(item.price * item.quantity)}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Notes */}
                    <div>
                        <input
                            type="text"
                            placeholder="Add order note (e.g. Less ice, extra hot, separate bag)..."
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 10px',
                                border: '2px solid black',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>

                    {/* Billing Breakdown */}
                    <div style={{
                        background: '#f8fafc',
                        border: '2px solid black',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Subtotal:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{formatRupiah(subtotal)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={includeTax}
                                    onChange={(e) => setIncludeTax(e.target.checked)}
                                />
                                Tax PB1 ({taxPercent}%):
                            </label>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{formatRupiah(taxAmount)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Discount (IDR):</span>
                            <input
                                type="number"
                                min="0"
                                max={subtotal}
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                style={{
                                    width: '100px',
                                    padding: '2px 6px',
                                    border: '1.5px solid black',
                                    textAlign: 'right',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>

                        <div style={{
                            borderTop: '2px solid black',
                            paddingTop: '8px',
                            marginTop: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>TOTAL DUE:</span>
                            <span style={{ fontWeight: '900', fontSize: '1.4rem', fontFamily: 'monospace', color: '#15803d' }}>
                                {formatRupiah(grandTotal)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '6px' }}>PAYMENT METHOD:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['CASH', 'QRIS', 'DEBIT', 'TRANSFER'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    style={{
                                        padding: '8px 4px',
                                        border: '2px solid black',
                                        background: paymentMethod === method ? '#f59e0b' : '#f3f4f6',
                                        color: paymentMethod === method ? 'black' : 'black',
                                        fontWeight: '900',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cash Tendered Calculator (If Cash) */}
                    {paymentMethod === 'CASH' && (
                        <div style={{
                            background: '#fef3c7',
                            border: '2px solid black',
                            padding: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '900' }}>CASH TENDERED:</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={cashTendered}
                                    onChange={(e) => setCashTendered(e.target.value)}
                                    style={{
                                        width: '140px',
                                        padding: '6px',
                                        border: '2px solid black',
                                        fontSize: '1rem',
                                        fontWeight: '900',
                                        fontFamily: 'monospace',
                                        textAlign: 'right'
                                    }}
                                />
                            </div>

                            {/* Quick Money Buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', marginBottom: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => handleQuickCash('EXACT')}
                                    style={{ padding: '4px', border: '1.5px solid black', background: 'white', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                    PAS
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickCash(50000)}
                                    style={{ padding: '4px', border: '1.5px solid black', background: 'white', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                    50K
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickCash(100000)}
                                    style={{ padding: '4px', border: '1.5px solid black', background: 'white', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                    100K
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickCash(150000)}
                                    style={{ padding: '4px', border: '1.5px solid black', background: 'white', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                    150K
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickCash(200000)}
                                    style={{ padding: '4px', border: '1.5px solid black', background: 'white', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                    200K
                                </button>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '1px dashed black',
                                paddingTop: '6px'
                            }}>
                                <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>CHANGE (KEMBALIAN):</span>
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontWeight: '900',
                                    fontSize: '1.1rem',
                                    color: isCashSufficient ? '#15803d' : '#dc2626'
                                }}>
                                    {isCashSufficient ? formatRupiah(changeAmount) : 'INSUFFICIENT!'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={clearCart}
                            disabled={cart.length === 0 || processing}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                            <RotateCcw size={16} /> CLEAR
                        </Button>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleProcessOrder}
                            disabled={cart.length === 0 || !isCashSufficient || processing}
                            style={{
                                background: '#22c55e',
                                color: 'black',
                                fontSize: '1rem',
                                fontWeight: '900',
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <CheckCircle2 size={20} />
                            {processing ? 'PROCESSING...' : 'CHARGE & PRINT'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* THERMAL RECEIPT MODAL */}
            <Modal
                isOpen={isReceiptOpen}
                title="ORDER RECEIPT - PAYMENT SUCCESSFUL"
                onClose={() => setIsReceiptOpen(false)}
            >
                <div style={{ textAlign: 'center', marginBottom: '20px' }} className="no-print">
                    <div style={{
                        display: 'inline-flex',
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '8px 16px',
                        border: '2px solid black',
                        fontWeight: '900',
                        gap: '6px',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <CheckCircle2 size={18} /> ORDER DISPATCHED TO KITCHEN & BAR
                    </div>
                </div>

                {/* Printable Receipt Paper Container */}
                <div
                    className="thermal-receipt-print-area"
                    style={{
                        background: '#fff',
                        border: '3px solid black',
                        padding: '20px',
                        fontFamily: 'monospace',
                        color: 'black',
                        maxWidth: '380px',
                        margin: '0 auto',
                        boxShadow: '4px 4px 0 0 rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: '900' }}>
                            {shopConfig?.shopName || 'SIAP NYAFE COFFEE'}
                        </h2>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            {shopConfig?.address || 'Jl. Kopi No. 1, Jakarta'}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Tel: {shopConfig?.phoneNumber || '021-12345678'}
                        </div>
                    </div>

                    <div style={{ borderTop: '2px dashed black', margin: '10px 0' }} />

                    {/* Metadata */}
                    <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>ORDER #:</span>
                            <strong>{completedOrder?.orderNumber}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>DATE:</span>
                            <span>{new Date(completedOrder?.createdAt || Date.now()).toLocaleString('id-ID')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>CASHIER:</span>
                            <span>{completedOrder?.shiftStaff || user?.name || 'Cashier'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>TYPE / TABLE:</span>
                            <strong>{completedOrder?.tableNumber || 'TAKEAWAY'}</strong>
                        </div>
                        {completedOrder?.customerName && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>CUSTOMER:</span>
                                <span>{completedOrder?.customerName}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ borderTop: '2px dashed black', margin: '10px 0' }} />

                    {/* Items */}
                    <div style={{ fontSize: '0.85rem' }}>
                        {(completedOrder?.items || []).map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>{item.name || item.menuName}</span>
                                    <span>{formatRupiah((item.price || 0) * (item.quantity || 1))}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                    {item.quantity} × {formatRupiah(item.price)}
                                    {item.notes ? ` (${item.notes})` : ''}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '2px dashed black', margin: '10px 0' }} />

                    {/* Financial Totals */}
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>SUBTOTAL:</span>
                            <span>{formatRupiah(completedOrder?.totalPrice || completedOrder?.totalAmount)}</span>
                        </div>
                        {completedOrder?.tax > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>TAX PB1 ({taxPercent}%):</span>
                                <span>{formatRupiah(completedOrder?.tax)}</span>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: '900',
                            fontSize: '1.1rem',
                            borderTop: '1px solid black',
                            paddingTop: '4px',
                            marginTop: '4px'
                        }}>
                            <span>GRAND TOTAL:</span>
                            <span>{formatRupiah(completedOrder?.grandTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>METHOD:</span>
                            <strong>{completedOrder?.paymentMethod || 'CASH'}</strong>
                        </div>
                        {completedOrder?.paymentMethod === 'CASH' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>CASH PAID:</span>
                                    <span>{formatRupiah(completedOrder?.paymentAmount)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>CHANGE:</span>
                                    <span>{formatRupiah(completedOrder?.changeAmount)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ borderTop: '2px dashed black', margin: '15px 0 10px 0' }} />

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: 'bold' }}>{shopConfig?.receiptFooter || 'TERIMA KASIH ATAS KUNJUNGAN ANDA!'}</div>
                        {shopConfig?.instagramUrl && <div>FOLLOW US ON INSTAGRAM {shopConfig.instagramUrl}</div>}
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '6px' }}>
                            Powered by Siap Nyafe Smart POS System
                        </div>
                    </div>
                </div>

                {/* Print and Close Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }} className="no-print">
                    <Button
                        variant="secondary"
                        onClick={() => setIsReceiptOpen(false)}
                    >
                        NEW ORDER (CLOSE)
                    </Button>
                    <Button
                        variant="primary"
                        onClick={printReceipt}
                        style={{
                            background: '#38bdf8',
                            color: 'black',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Printer size={18} /> PRINT THERMAL RECEIPT
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
