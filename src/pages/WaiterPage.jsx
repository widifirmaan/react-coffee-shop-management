import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Clock, Volume2, VolumeX } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { NotificationCard } from '../components/ui/NotificationCard';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';

const playWaiterAlertSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const now = ctx.currentTime;
        // Urgent 3-pulse waiter call chime (800Hz - 1000Hz)
        [0, 0.12, 0.24].forEach((delay, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 1046.5, now + delay);
            gain.gain.setValueAtTime(0.25, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.1);
        });
    } catch (e) {
        console.warn('Audio playback not supported or blocked', e);
    }
};

export default function WaiterPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmId, setConfirmId] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);

    const [soundAlert, setSoundAlert] = useState(() => localStorage.getItem('waiter_sound_alert') !== 'false');
    const knownNotifIdsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);

    const toggleSound = () => {
        setSoundAlert(prev => {
            const next = !prev;
            localStorage.setItem('waiter_sound_alert', String(next));
            if (next) playWaiterAlertSound();
            return next;
        });
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [soundAlert]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            const data = Array.isArray(res.data) ? res.data : [];

            // Detect new incoming notifications
            if (!isFirstLoadRef.current && soundAlert) {
                const hasNew = data.some(n => !knownNotifIdsRef.current.has(n.id));
                if (hasNew) {
                    playWaiterAlertSound();
                }
            }
            knownNotifIdsRef.current = new Set(data.map(n => n.id));
            isFirstLoadRef.current = false;

            setNotifications(data);
            setLoading(false);
        } catch (e) {
            console.error('Fetch notifications error', e);
            setLoading(false);
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
            setAlertMsg({ type: 'success', message: 'REQUEST RESOLVED!' });
            setConfirmId(null);
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO RESOLVE NOTIFICATION' });
        }
    };

    return (
        <div className="page-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="WAITER DASHBOARD"
                description={`${notifications.length} ACTIVE NOTIFICATIONS`}
                color="#60a5fa"
                action={
                    <Button
                        variant={soundAlert ? 'success' : 'secondary'}
                        onClick={toggleSound}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 'bold' }}
                    >
                        {soundAlert ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        {soundAlert ? 'SOUND ON' : 'MUTED'}
                    </Button>
                }
            />

            <div>
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

            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}
        </div>
    );
}
