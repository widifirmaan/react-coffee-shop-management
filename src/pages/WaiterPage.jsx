import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Check, Clock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { NotificationCard } from '../components/ui/NotificationCard';
import { Modal } from '../components/ui/Modal';

export default function WaiterPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDismissClick = (id) => {
        setConfirmId(id);
    };

    const confirmDismiss = async () => {
        if (!confirmId) return;
        try {
            await axios.put(`/api/notifications/${confirmId}/read`);
            setNotifications(prev => prev.filter(n => n.id !== confirmId));
            setConfirmId(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="page-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader title="WAITER DASHBOARD" description="REAL-TIME NOTIFICATIONS" color="#60a5fa" />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>LOADING...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>
                        <Bell size={48} style={{ marginBottom: '20px' }} />
                        <h3>NO ACTIVE REQUESTS</h3>
                        <p>Relax, everything is under control.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {notifications.map(n => (
                            <NotificationCard key={n.id} notification={n} onDismiss={handleDismissClick} />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="CONFIRM ACTION">
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
                    Mark this request as RESOLVED?
                </p>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Button variant="secondary" onClick={() => setConfirmId(null)} style={{ flex: 1 }}>CANCEL</Button>
                    <Button variant="primary" onClick={confirmDismiss} style={{ flex: 1 }}>YES, RESOLVE</Button>
                </div>
            </Modal>
        </div>
    );
}
