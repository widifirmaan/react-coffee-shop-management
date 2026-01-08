import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, User, Hash, CheckCircle, Edit2, Plus, Minus, Trash2, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';

import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import PageHeader from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [menus, setMenus] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchOrders();
        fetchMenus();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            const activeOrders = res.data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
            const completedList = res.data.filter(o => o.status === 'COMPLETED');
            setOrders(activeOrders.reverse());
            setCompletedOrders(completedList.reverse());
        } catch (e) {
            console.error("Fetch orders failed", e);
        }
    };

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            setMenus(res.data.filter(m => m.available));
        } catch (e) {
            console.error("Failed to fetch menus", e);
        }
    };

    const handleStatusChange = (orderId, newStatus) => {
        const messages = {
            'PREPARING': 'START PREPARING THIS ORDER?',
            'READY_TO_SERVE': 'MARK ORDER AS READY?',
            'COMPLETED': 'MARK ORDER AS SERVED?'
        };
        setConfirmDialog({ orderId, newStatus, message: messages[newStatus] || 'CHANGE STATUS?' });
    };

    const confirmStatusChange = async () => {
        if (!confirmDialog) return;
        try {
            await axios.patch(`/api/orders/${confirmDialog.orderId}/status?status=${confirmDialog.newStatus}`);
            setAlertMsg({ type: 'success', message: `STATUS UPDATED TO ${confirmDialog.newStatus}!` });
            fetchOrders();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO UPDATE STATUS!' });
        }
        setConfirmDialog(null);
    };

    const handleUpdateQuantity = (idx, change) => {
        const newItems = [...editingOrder.items];
        newItems[idx].quantity = Math.max(1, newItems[idx].quantity + change);
        setEditingOrder({ ...editingOrder, items: newItems });
    };

    const handleRemoveItem = (idx) => {
        const newItems = editingOrder.items.filter((_, i) => i !== idx);
        if (newItems.length === 0) return setAlertMsg({ type: 'error', message: 'ORDER MUST HAVE AT LEAST 1 ITEM!' });
        setEditingOrder({ ...editingOrder, items: newItems });
    };

    const handleAddItem = (menu) => {
        const existingIdx = editingOrder.items.findIndex(i => i.menuId === menu.id);
        const newItems = [...editingOrder.items];

        if (existingIdx >= 0) {
            newItems[existingIdx].quantity += 1;
        } else {
            newItems.push({ menuId: menu.id, menuName: menu.name, price: menu.price, quantity: 1 });
        }
        setEditingOrder({ ...editingOrder, items: newItems });
    };

    const handleSaveOrder = async () => {
        try {
            const updatedOrder = {
                items: editingOrder.items,
                customerName: editingOrder.customerName,
                tableNumber: editingOrder.tableNumber,
                status: editingOrder.status,
                paymentMethod: editingOrder.paymentMethod
            };
            await axios.put(`/api/orders/${editingOrder.id}`, updatedOrder);
            setAlertMsg({ type: 'success', message: 'ORDER UPDATED SUCCESSFULLY!' });
            setEditingOrder(null);
            fetchOrders();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO UPDATE ORDER!' });
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PREPARING': return 'info';
            case 'READY_TO_SERVE': return 'success';
            case 'COMPLETED': return 'default';
            default: return 'default';
        }
    };
    // Filter and Paginate History
    const filteredHistory = completedOrders.filter(o =>
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalHistoryPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="kitchen-page-container">
            {/* Header */}
            <PageHeader
                title="KITCHEN QUEUE"
                description={`${orders.length} ACTIVE ORDERS`}
                icon={ChefHat}
                color="#fef08a"
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
                {orders.map(order => (
                    <Card key={order.id} style={{ background: 'white', padding: '20px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid black', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold' }}>ORDER ID</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>#{order.id.substring(0, 8).toUpperCase()}</div>
                            </div>
                            <Badge variant={getStatusVariant(order.status)}>
                                {order.status.replace(/_/g, ' ')}
                            </Badge>
                        </div>

                        {/* Customer Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f3f4f6', border: '2px solid black' }}>
                                <User size={20} />
                                <b style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customerName || 'Anon'}</b>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f3f4f6', border: '2px solid black' }}>
                                <Hash size={20} /> <b>{order.tableNumber}</b>
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <div style={{ marginBottom: '15px', background: '#fef3c7', padding: '15px', border: '2px dashed black' }}>
                                <b style={{ color: '#b45309' }}>⚠️ NOTES:</b> {order.notes}
                            </div>
                        )}

                        {/* Items */}
                        <div style={{ marginBottom: '15px' }}>
                            {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                                    <span><b>{item.quantity}x</b> {item.menuName}</span>
                                </div>
                            ))}
                        </div>

                        {/* Staff Info */}
                        {order.shiftStaff && (
                            <div style={{ marginBottom: '15px', fontSize: '0.85rem', background: '#dbeafe', padding: '10px', border: '2px solid black' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}><Users size={16} /> STAFF:</div>
                                {Object.entries(order.shiftStaff).map(([role, name]) => name && (
                                    <div key={role} style={{ textTransform: 'capitalize' }}>
                                        {role.replace(/([A-Z])/g, ' $1')}: <b>{name}</b>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {order.status === 'PENDING' && (
                                <Button onClick={() => handleStatusChange(order.id, 'PREPARING')} variant="primary" style={{ flex: 1 }}>
                                    START PREP
                                </Button>
                            )}
                            {order.status === 'PREPARING' && (
                                <Button onClick={() => handleStatusChange(order.id, 'READY_TO_SERVE')} variant="success" style={{ flex: 1 }}>
                                    MARK READY
                                </Button>
                            )}
                            {order.status === 'READY_TO_SERVE' && (
                                <Button onClick={() => handleStatusChange(order.id, 'COMPLETED')} variant="primary" style={{ flex: 1 }}>
                                    MARK SERVED
                                </Button>
                            )}
                            <Button onClick={() => setEditingOrder({ ...order })} variant="secondary" style={{ background: '#fde68a' }}>
                                <Edit2 size={18} />
                            </Button>
                        </div>
                    </Card>
                ))}

                {orders.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5, padding: '50px' }}>
                        <ChefHat size={80} />
                        <h2>NO ACTIVE ORDERS</h2>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '60px' }}>
                <Card onClick={() => setShowHistory(!showHistory)} style={{ background: '#d1fae5', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <CheckCircle size={36} />
                        <div>
                            <h2 className="card-title" style={{ margin: 0 }}>ORDER HISTORY</h2>
                            <small>{completedOrders.length} COMPLETED</small>
                        </div>
                    </div>
                    <span style={{ fontSize: '2rem' }}>{showHistory ? '▼' : '▶'}</span>
                </Card>

                {showHistory && (
                    <>
                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="SEARCH BY CUSTOMER OR ID..."
                            />
                        </div>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        {['ID', 'CUSTOMER', 'TABLE', 'ITEMS', 'TOTAL', 'ACTION'].map(h => <Th key={h}>{h}</Th>)}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paginatedHistory.map((order, idx) => (
                                        <Tr key={order.id} index={idx}>
                                            <Td style={{ fontWeight: 'bold' }}>#{order.id.substring(0, 8)}</Td>
                                            <Td>{order.customerName}</Td>
                                            <Td>{order.tableNumber}</Td>
                                            <Td>{order.items?.map(i => `${i.quantity}x ${i.menuName}`).join(', ')}</Td>
                                            <Td>Rp {order.grandTotal?.toLocaleString()}</Td>
                                            <Td>
                                                <Button title="Requeue" onClick={() => handleStatusChange(order.id, 'PENDING')} variant="secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>↻</Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <Tr>
                                            <Td colSpan="6" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', opacity: 0.5 }}>
                                                NO COMPLETED ORDERS FOUND.
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                        {filteredHistory.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalHistoryPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                totalItems={filteredHistory.length}
                            />
                        )}
                    </>
                )}
            </div>

            {/* EDIT MODAL */}
            <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title={`EDIT ORDER`} maxWidth="800px">
                {editingOrder && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <Input label="CUSTOMER NAME" value={editingOrder.customerName} onChange={e => setEditingOrder({ ...editingOrder, customerName: e.target.value })} />
                            <Select label="TABLE" value={editingOrder.tableNumber} onChange={e => setEditingOrder({ ...editingOrder, tableNumber: e.target.value })}
                                options={[{ value: 'Take Away', label: 'Take Away' }, ...[...Array(20)].map((_, i) => ({ value: `Table ${i + 1}`, label: `Table ${i + 1}` }))]} />
                            <Select label="STATUS" value={editingOrder.status} onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                options={['PENDING', 'PREPARING', 'READY_TO_SERVE', 'COMPLETED'].map(s => ({ value: s, label: s }))} />
                            <Select label="PAYMENT" value={editingOrder.paymentMethod} onChange={e => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value })}
                                options={['CASH', 'QRIS', 'DEBIT'].map(p => ({ value: p, label: p }))} />
                        </div>

                        <h3>ITEMS</h3>
                        {editingOrder.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                                <span>{item.menuName} (Rp {item.price})</span>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Button onClick={() => handleUpdateQuantity(idx, -1)} variant="danger" style={{ padding: '5px' }}><Minus size={14} /></Button>
                                    <b>{item.quantity}</b>
                                    <Button onClick={() => handleUpdateQuantity(idx, 1)} variant="success" style={{ padding: '5px' }}><Plus size={14} /></Button>
                                    <Button onClick={() => handleRemoveItem(idx)} variant="danger" style={{ marginLeft: '10px', padding: '5px' }}><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '20px', borderTop: '4px solid black', paddingTop: '20px' }}>
                            <h4 style={{ marginBottom: '10px' }}>ADD ITEM</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                {menus.map(m => (
                                    <button key={m.id} onClick={() => handleAddItem(m)} style={{ padding: '10px', border: '2px solid black', background: '#fef08a', cursor: 'pointer', textAlign: 'left' }}>
                                        <b>{m.name}</b><br /><small>{m.price}</small>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <Button onClick={() => setEditingOrder(null)} variant="secondary" style={{ flex: 1 }}>CANCEL</Button>
                            <Button onClick={handleSaveOrder} variant="primary" style={{ flex: 1 }}>SAVE CHANGES</Button>
                        </div>
                    </>
                )}
            </Modal>

            {/* CONFIRMATION */}
            <Modal isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} title="CONFIRM ACTION" maxWidth="500px">
                {confirmDialog && (
                    <>
                        <h2 style={{ textAlign: 'center', margin: '20px 0' }}>{confirmDialog.message}</h2>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <Button onClick={() => setConfirmDialog(null)} variant="secondary" style={{ flex: 1 }}>CANCEL</Button>
                            <Button onClick={confirmStatusChange} variant="primary" style={{ flex: 1 }}>CONFIRM</Button>
                        </div>
                    </>
                )}
            </Modal>

            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}
        </div>
    );
}
