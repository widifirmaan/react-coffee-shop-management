import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, User, Hash, DollarSign, Users, Clock, CheckCircle, Edit2, Plus, Minus, Trash2 } from 'lucide-react';

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null); // { orderId, newStatus, message }
    const [alertMsg, setAlertMsg] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null); // Order being edited
    const [menus, setMenus] = useState([]); // Available menus for adding new items

    useEffect(() => {
        fetchOrders();
        fetchMenus();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto-hide alert after 3 seconds
    useEffect(() => {
        if (alertMsg) {
            const timer = setTimeout(() => setAlertMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alertMsg]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            // Separate active and completed orders
            const activeOrders = res.data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
            const completedList = res.data.filter(o => o.status === 'COMPLETED');
            setOrders(activeOrders.reverse());
            setCompletedOrders(completedList.reverse());
        } catch (e) {
            console.error("Fetch orders failed", e);
        }
    };

    const handleStatusChange = (orderId, newStatus, currentStatus) => {
        const statusMessages = {
            'PREPARING': 'START PREPARING THIS ORDER?',
            'READY_TO_SERVE': 'MARK ORDER AS READY?',
            'COMPLETED': 'MARK ORDER AS SERVED?'
        };

        setConfirmDialog({
            orderId,
            newStatus,
            currentStatus,
            message: statusMessages[newStatus] || 'CHANGE STATUS?'
        });
    };

    const confirmStatusChange = async () => {
        if (!confirmDialog) return;

        const { orderId, newStatus } = confirmDialog;

        try {
            await axios.patch(`/api/orders/${orderId}/status?status=${newStatus}`);
            setAlertMsg({ type: 'success', message: `STATUS UPDATED TO ${newStatus}!` });
            fetchOrders();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO UPDATE STATUS!' });
        }

        setConfirmDialog(null);
    };


    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            setMenus(res.data.filter(m => m.available));
        } catch (e) {
            console.error("Failed to fetch menus", e);
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder({ ...order, items: [...order.items] });
    };

    const handleUpdateQuantity = (itemIndex, change) => {
        const newItems = [...editingOrder.items];
        newItems[itemIndex].quantity += change;
        if (newItems[itemIndex].quantity < 1) newItems[itemIndex].quantity = 1;
        setEditingOrder({ ...editingOrder, items: newItems });
    };

    const handleRemoveItem = (itemIndex) => {
        const newItems = editingOrder.items.filter((_, idx) => idx !== itemIndex);
        if (newItems.length === 0) {
            setAlertMsg({ type: 'error', message: 'ORDER MUST HAVE AT LEAST 1 ITEM!' });
            return;
        }
        setEditingOrder({ ...editingOrder, items: newItems });
    };

    const handleAddItem = (menu) => {
        const existingItemIndex = editingOrder.items.findIndex(item => item.menuId === menu.id);

        if (existingItemIndex >= 0) {
            // Item already exists, increment quantity
            const newItems = [...editingOrder.items];
            newItems[existingItemIndex].quantity += 1;
            setEditingOrder({ ...editingOrder, items: newItems });
        } else {
            // Add new item
            const newItems = [...editingOrder.items, {
                menuId: menu.id,
                menuName: menu.name,
                price: menu.price,
                quantity: 1
            }];
            setEditingOrder({ ...editingOrder, items: newItems });
        }
    };

    const handleSaveOrder = async () => {
        try {
            // Recalculate total
            const totalAmount = editingOrder.items.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0);

            const updatedOrder = {
                items: editingOrder.items,
                customerName: editingOrder.customerName,
                tableNumber: editingOrder.tableNumber,
                status: editingOrder.status,
                paymentMethod: editingOrder.paymentMethod
            };

            console.log("Sending updated order:", updatedOrder);
            await axios.put(`/api/orders/${editingOrder.id}`, updatedOrder);
            setAlertMsg({ type: 'success', message: 'ORDER UPDATED SUCCESSFULLY!' });
            setEditingOrder(null);
            fetchOrders();
        } catch (e) {
            console.error("Update order error:", e.response?.data || e.message);
            setAlertMsg({ type: 'error', message: 'FAILED TO UPDATE ORDER!' });
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            {/* Alert Notification */}
            {alertMsg && (
                <div style={{
                    position: 'fixed',
                    top: '30px',
                    right: '30px',
                    padding: '20px 30px',
                    background: alertMsg.type === 'success' ? '#86efac' : '#fca5a5',
                    border: '4px solid black',
                    boxShadow: '10px 10px 0 0 black',
                    zIndex: 9999,
                    fontWeight: '900',
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    maxWidth: '400px'
                }}>
                    {alertMsg.message}
                </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 10001,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        border: '4px solid black',
                        boxShadow: '15px 15px 0 0 black',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Edit2 size={32} /> EDIT ORDER #{editingOrder.id.substring(0, 8).toUpperCase()}
                        </h2>

                        {/* Customer Info & Status */}
                        <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    CUSTOMER NAME
                                </label>
                                <input
                                    type="text"
                                    value={editingOrder.customerName}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '3px solid black',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    TABLE NUMBER
                                </label>
                                <select
                                    value={editingOrder.tableNumber}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, tableNumber: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '3px solid black',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Take Away">Take Away</option>
                                    {[...Array(30)].map((_, i) => (
                                        <option key={i} value={`Table ${i + 1}`}>Table {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    STATUS
                                </label>
                                <select
                                    value={editingOrder.status}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '3px solid black',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        background: editingOrder.status === 'PENDING' ? '#fde68a' :
                                            editingOrder.status === 'PREPARING' ? '#bfdbfe' :
                                                editingOrder.status === 'READY_TO_SERVE' ? '#86efac' : '#fca5a5'
                                    }}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PREPARING">PREPARING</option>
                                    <option value="READY_TO_SERVE">READY TO SERVE</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    PAYMENT METHOD
                                </label>
                                <select
                                    value={editingOrder.paymentMethod || 'CASH'}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '3px solid black',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="CASH">CASH / TUNAI</option>
                                    <option value="QRIS">QRIS</option>
                                    <option value="TRANSFER">BANK TRANSFER</option>
                                    <option value="E-WALLET">E-WALLET (GoPay/OVO/Dana)</option>
                                    <option value="DEBIT">DEBIT / CREDIT CARD</option>
                                </select>
                            </div>
                        </div>

                        {/* Current Items */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', borderBottom: '3px solid black', paddingBottom: '10px' }}>
                                CURRENT ITEMS
                            </h3>
                            {editingOrder.items.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    border: '3px solid black',
                                    background: '#f9fafb'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.menuName}</div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Rp {item.price?.toLocaleString()} each</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button
                                            onClick={() => handleUpdateQuantity(idx, -1)}
                                            style={{
                                                background: '#fca5a5',
                                                border: '3px solid black',
                                                padding: '8px 12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span style={{ fontWeight: '900', fontSize: '1.2rem', minWidth: '40px', textAlign: 'center' }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(idx, 1)}
                                            style={{
                                                background: '#86efac',
                                                border: '3px solid black',
                                                padding: '8px 12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            style={{
                                                background: '#fee2e2',
                                                border: '3px solid black',
                                                padding: '8px 12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                marginLeft: '10px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Total */}
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                background: 'black',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: '900',
                                fontSize: '1.3rem'
                            }}>
                                <span>NEW TOTAL</span>
                                <span>Rp {editingOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Add New Item */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', borderBottom: '3px solid black', paddingBottom: '10px' }}>
                                ADD NEW ITEM
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {menus.map(menu => (
                                    <button
                                        key={menu.id}
                                        onClick={() => handleAddItem(menu)}
                                        style={{
                                            padding: '15px',
                                            border: '3px solid black',
                                            background: '#fef08a',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '5px'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.95rem' }}>{menu.name}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Rp {menu.price?.toLocaleString()}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setEditingOrder(null)}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    background: 'white',
                                    color: 'black',
                                    border: '4px solid black',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSaveOrder}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    background: 'black',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                SAVE CHANGES
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 10000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        border: '4px solid black',
                        boxShadow: '15px 15px 0 0 black',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '30px', textTransform: 'uppercase', textAlign: 'center' }}>
                            {confirmDialog.message}
                        </h2>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setConfirmDialog(null)}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    background: 'white',
                                    color: 'black',
                                    border: '4px solid black',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    background: 'black',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '40px', background: '#fef08a', border: '4px solid black', padding: '20px', boxShadow: '8px 8px 0 0 black' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ChefHat size={48} /> KITCHEN QUEUE
                </h1>
                <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', opacity: 0.6 }}>{orders.length} ACTIVE ORDERS</p>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
                {orders.map(order => (
                    <div key={order.id} className="card" style={{
                        background: 'white',
                        border: '4px solid black',
                        padding: '20px',
                        boxShadow: '8px 8px 0 0 black'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid black', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold' }}>ORDER ID</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>#{order.id.substring(0, 8).toUpperCase()}</div>
                            </div>
                            <div style={{
                                background: order.status === 'PENDING' ? '#fef08a' : order.status === 'PREPARING' ? '#fca5a5' : '#86efac',
                                color: 'black',
                                padding: '8px 16px',
                                border: '2px solid black',
                                fontWeight: '900',
                                fontSize: '0.9rem'
                            }}>
                                {order.status}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div style={{ marginBottom: '15px', background: '#f3f4f6', padding: '15px', border: '2px solid black' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <User size={20} />
                                <span style={{ fontWeight: 'bold' }}>{order.customerName || 'Anonymous'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Hash size={20} />
                                <span style={{ fontWeight: 'bold' }}>Table {order.tableNumber || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {order.notes && (
                            <div style={{ marginBottom: '15px', background: '#fef3c7', padding: '15px', border: '2px dashed black' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem', color: '#b45309' }}>⚠️ CUSTOMER NOTES:</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{order.notes}</div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>ITEMS:</div>
                            {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                    <div>
                                        <b>{item.quantity}x</b> {item.menuName}
                                    </div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        Rp {item.price?.toLocaleString()} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>ea</span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '15px', background: 'black', color: 'white', fontWeight: '900', fontSize: '1.2rem' }}>
                                <span>TOTAL</span>
                                <span>Rp {order.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Shift Staff */}
                        {order.shiftStaff && (
                            <div style={{ marginBottom: '15px', background: '#dbeafe', padding: '15px', border: '2px solid black' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={20} /> SHIFT STAFF
                                </div>
                                <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                                    {order.shiftStaff.cashier && <div>💰 Cashier: <b>{order.shiftStaff.cashier}</b></div>}
                                    {order.shiftStaff.barista && <div>☕ Barista: <b>{order.shiftStaff.barista}</b></div>}
                                    {order.shiftStaff.kitchenStaff && <div>👨‍🍳 Kitchen: <b>{order.shiftStaff.kitchenStaff}</b></div>}
                                    {order.shiftStaff.waiter && <div>🍽️ Waiter: <b>{order.shiftStaff.waiter}</b></div>}
                                    {order.shiftStaff.cleaningService && <div>🧹 Cleaning: <b>{order.shiftStaff.cleaningService}</b></div>}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {order.status === 'PENDING' && (
                                <button onClick={() => handleStatusChange(order.id, 'PREPARING', order.status)} className="primary" style={{ flex: 1 }}>
                                    START PREP
                                </button>
                            )}
                            {order.status === 'PREPARING' && (
                                <button onClick={() => handleStatusChange(order.id, 'READY_TO_SERVE', order.status)} style={{ flex: 1, background: '#86efac', border: '4px solid black', fontWeight: '900', padding: '12px', cursor: 'pointer', fontSize: '1rem' }}>
                                    MARK READY
                                </button>
                            )}
                            {order.status === 'READY_TO_SERVE' && (
                                <button onClick={() => handleStatusChange(order.id, 'COMPLETED', order.status)} className="primary" style={{ flex: 1 }}>
                                    MARK SERVED
                                </button>
                            )}



                            {/* Edit Button */}
                            <button
                                onClick={() => handleEditOrder(order)}
                                style={{
                                    flex: 1,
                                    background: '#fde68a',
                                    border: '4px solid black',
                                    fontWeight: '900',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Edit2 size={18} /> EDIT
                            </button>
                        </div>
                    </div>
                ))}


                {orders.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', opacity: 0.5 }}>
                        <ChefHat size={80} style={{ margin: '0 auto 20px' }} />
                        <h2>NO ACTIVE ORDERS</h2>
                        <p>Kitchen is clear! 🎉</p>
                    </div>
                )}
            </div>

            {/* HISTORY SECTION */}
            <div style={{ marginTop: '60px' }}>
                <div
                    onClick={() => setShowHistory(!showHistory)}
                    style={{
                        marginBottom: '30px',
                        background: '#d1fae5',
                        border: '4px solid black',
                        padding: '20px',
                        boxShadow: '8px 8px 0 0 black',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <CheckCircle size={36} /> ORDER HISTORY
                            </h2>
                            <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', opacity: 0.6 }}>
                                {completedOrders.length} COMPLETED ORDERS
                            </p>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {showHistory ? '▼' : '▶'}
                        </div>
                    </div>
                </div>

                {showHistory && (
                    <div style={{
                        background: 'white',
                        border: '4px solid black',
                        boxShadow: '8px 8px 0 0 black',
                        overflow: 'hidden'
                    }}>
                        {completedOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                                <Clock size={60} style={{ margin: '0 auto 20px' }} />
                                <h3>NO COMPLETED ORDERS YET</h3>
                                <p>History will appear here once orders are served</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'black', color: 'white' }}>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>ORDER ID</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>CUSTOMER</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>TABLE</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>ITEMS</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>TOTAL</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>PAYMENT</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900', borderRight: '2px solid white' }}>STAFF</th>
                                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '900' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedOrders.map((order, idx) => (
                                            <tr key={order.id} style={{
                                                background: idx % 2 === 0 ? '#f9fafb' : 'white',
                                                borderBottom: '2px solid black'
                                            }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>
                                                    #{order.id.substring(0, 8).toUpperCase()}
                                                </td>
                                                <td style={{ padding: '15px', borderRight: '1px solid #e5e7eb' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <User size={16} />
                                                        <span style={{ fontWeight: 'bold' }}>{order.customerName || 'Anonymous'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', borderRight: '1px solid #e5e7eb' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Hash size={16} />
                                                        <span style={{ fontWeight: 'bold' }}>{order.tableNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', borderRight: '1px solid #e5e7eb' }}>
                                                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                                        {order.items?.map((item, itemIdx) => (
                                                            <div key={itemIdx} style={{ marginBottom: '4px' }}>
                                                                <b>{item.quantity}x</b> {item.menuName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', fontWeight: '900', fontSize: '1.1rem', borderRight: '1px solid #e5e7eb' }}>
                                                    Rp {order.totalAmount?.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '15px', borderRight: '1px solid #e5e7eb' }}>
                                                    <span style={{
                                                        background: '#e5e7eb',
                                                        padding: '4px 8px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase',
                                                        border: '1px solid #9ca3af'
                                                    }}>
                                                        {order.paymentMethod || 'CASH'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px', borderRight: '1px solid #e5e7eb' }}>
                                                    {order.shiftStaff ? (
                                                        <div style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
                                                            {order.shiftStaff.cashier && <div>💰 {order.shiftStaff.cashier}</div>}
                                                            {order.shiftStaff.barista && <div>☕ {order.shiftStaff.barista}</div>}
                                                            {order.shiftStaff.kitchenStaff && <div>👨‍🍳 {order.shiftStaff.kitchenStaff}</div>}
                                                            {order.shiftStaff.waiter && <div>🍽️ {order.shiftStaff.waiter}</div>}
                                                        </div>
                                                    ) : (
                                                        <span style={{ opacity: 0.5 }}>-</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmDialog({
                                                                orderId: order.id,
                                                                newStatus: 'PENDING',
                                                                message: 'REQUEUE THIS ORDER?'
                                                            });
                                                        }}
                                                        style={{
                                                            background: 'white',
                                                            color: 'black',
                                                            border: '2px solid black',
                                                            padding: '6px 12px',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        ↻ REQUEUE
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    );
}
