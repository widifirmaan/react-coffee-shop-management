import { useState, useEffect } from 'react';
import axios from 'axios';

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            // Filter out completed/cancelled if needed, for now show all sorted by time
            setOrders(res.data.reverse());
        } catch (e) {
            console.error("Fetch orders failed", e);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`/api/orders/${id}/status?status=${status}`);
            fetchOrders();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    return (
        <div>
            <h1>KITCHEN QUEUE</h1>
            <div className="grid">
                {orders.map(order => (
                    <div key={order.id} className={`card status-${order.status.toLowerCase().replace(/_/g, '-')}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>#{order.id.substring(0, 4)}</span>
                            <span className="badge">{order.status}</span>
                        </div>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '5px' }}>
                                <b>{item.quantity}x</b> {item.menuName}
                            </div>
                        ))}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {order.status === 'PENDING' && (
                                <button onClick={() => updateStatus(order.id, 'PREPARING')}>START PREP</button>
                            )}
                            {order.status === 'PREPARING' && (
                                <button onClick={() => updateStatus(order.id, 'READY_TO_SERVE')}>READY</button>
                            )}
                            {order.status === 'READY_TO_SERVE' && (
                                <button onClick={() => updateStatus(order.id, 'COMPLETED')}>SERVED</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
