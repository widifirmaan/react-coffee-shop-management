import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package, ChefHat, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AttendanceWidget } from '../components/dashboard/AttendanceWidget';
import { TeamNotesWidget } from '../components/dashboard/TeamNotesWidget';
import { StatsCard } from '../components/dashboard/StatsCard';
import { WeeklyShiftSchedule } from '../components/dashboard/WeeklyShiftSchedule';
import PageHeader from '../components/ui/PageHeader';

export default function DashboardPage({ user }) {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalMenuItems: 0,
        totalEmployees: 0
    });
    const [loading, setLoading] = useState(true);

    const [attendance, setAttendance] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [noteContent, setNoteContent] = useState('');
    const [originalNoteContent, setOriginalNoteContent] = useState('');
    const [isNoteDirty, setIsNoteDirty] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [weeklyShifts, setWeeklyShifts] = useState([]);
    const [lateModal, setLateModal] = useState(null); // { type: 'late', message: '', details: '' }
    const [isNoteHover, setIsNoteHover] = useState(false);

    // Helper for case-insensitive role check
    const isManager = user && (user.role === 'MANAGER' || user.role === 'manager');

    useEffect(() => {
        if (alertMsg) {
            const timer = setTimeout(() => setAlertMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alertMsg]);

    useEffect(() => {
        fetchDashboardData();
        checkAttendance();
        fetchNote();
        fetchShiftData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchShiftData = async () => {
        try {
            // Fetch Shifts & Today's Attendance
            const [shiftRes, attRes] = await Promise.all([
                axios.get('/api/shifts'),
                axios.get('/api/attendance') // FETCH ALL HISTORY
            ]);

            const allShifts = shiftRes.data;
            const allAttendance = attRes.data;

            // Group by Employee
            const grouped = {};
            allShifts.forEach(s => {
                if (!grouped[s.employeeId]) {
                    grouped[s.employeeId] = {
                        id: s.employeeId,
                        name: s.employeeName,
                        position: s.position,
                        schedule: {},
                        attendance: {}
                    };
                }
                grouped[s.employeeId].schedule[s.dayOfWeek] = s.shiftType;
            });

            // Attach Attendance History to Employee
            Object.values(grouped).forEach(emp => {
                emp.attendanceHistory = {};
                allAttendance.filter(a => a.employeeId === emp.id).forEach(a => {
                    emp.attendanceHistory[a.date] = a;
                });

                // Set Today Status
                const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
                const todayAtt = emp.attendanceHistory[todayStr];
                emp.todayStatus = todayAtt ? todayAtt.status : null;
            });

            setWeeklyShifts(Object.values(grouped));
        } catch (e) {
            console.error("Failed to fetch shift data", e);
        }
    };

    const fetchNote = async () => {
        try {
            const res = await axios.get('/api/notes/dashboard');
            if (res.data) {
                setNoteContent(res.data.content || '');
                setOriginalNoteContent(res.data.content || '');
            }
        } catch (e) {
            console.error("Failed to fetch note");
        }
    };

    const handleSaveNote = async () => {
        try {
            await axios.post('/api/notes/dashboard', {
                content: noteContent,
                updatedBy: user.username
            });
            setIsNoteDirty(false);
            setOriginalNoteContent(noteContent);
            setIsEditing(false);
            setAlertMsg({ type: 'success', message: 'NOTE SAVED SUCCESSFULLY!' });
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO SAVE NOTE!' });
        }
    };

    const checkAttendance = async () => {
        if (!user || (!user.id && !user.employeeId)) return;
        try {
            const id = user.id || user.employeeId;
            const res = await axios.get(`/api/attendance/today/${id}`);
            setAttendance(res.data);
        } catch (error) {
            console.log("No attendance record yet (or error)");
        }
    };

    const handleClockIn = () => {
        setConfirmation({
            message: "CONFIRM CLOCK IN?",
            onConfirm: async () => {
                try {
                    const payload = {
                        employeeId: user.id || user.employeeId,
                        employeeName: user.name || user.username
                    };
                    const res = await axios.post('/api/attendance/clock-in', payload);
                    if (res.data.checkInStatus === 'BLOCKED') {
                        setLateModal({
                            type: 'blocked',
                            message: 'LOCKED OUT!',
                            details: res.data.debugInfo
                        });
                        setAlertMsg({ type: 'error', message: 'ACCOUNT LOCKED!' });
                    } else {
                        setAttendance(res.data);

                        // Check status
                        if (res.data.checkInStatus === 'LATE') {
                            setLateModal({
                                type: 'late',
                                message: 'LATE ARRIVAL DETECTED!',
                                details: `YOU ARE ${res.data.minutesLate} MINUTES LATE. PLEASE EXPLAIN TO MANAGER.`
                            });
                            setAlertMsg({ type: 'error', message: 'LATE RECORDED!' });
                        } else {
                            setAlertMsg({ type: 'success', message: 'CLOCKED IN SUCCESSFULLY!' });
                        }

                        fetchShiftData();
                    }
                } catch (error) {
                    setAlertMsg({ type: 'error', message: 'CLOCK IN FAILED!' });
                }
                setConfirmation(null);
            }
        });
    };

    const handleClockOut = () => {
        setConfirmation({
            message: "CONFIRM CLOCK OUT?",
            onConfirm: async () => {
                try {
                    const id = user.id || user.employeeId;
                    const res = await axios.post('/api/attendance/clock-out', { employeeId: id });

                    if (res.data && res.data.checkInStatus === 'TOO_EARLY') {
                        setLateModal({
                            type: 'early',
                            message: 'TOO EARLY!',
                            details: res.data.debugInfo
                        });
                        setAlertMsg({ type: 'error', message: 'SHIFT INCOMPLETE!' });
                    } else {
                        setAttendance(res.data);
                        setAlertMsg({ type: 'success', message: 'CLOCKED OUT SUCCESSFULLY!' });
                        fetchShiftData();
                    }
                } catch (error) {
                    setAlertMsg({ type: 'error', message: 'CLOCK OUT FAILED!' });
                }
                setConfirmation(null);
            }
        });
    };

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersRes = await axios.get('/api/orders');
            const orders = ordersRes.data;

            // Calculate today's stats
            const today = new Date().toDateString();
            const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
            const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

            // Fetch menus
            const menusRes = await axios.get('/api/menus');
            const totalMenuItems = menusRes.data.length;

            // Fetch ingredients
            const ingredientsRes = await axios.get('/api/ingredients');
            const lowStockItems = ingredientsRes.data.filter(i => i.quantity < i.minThreshold).length;

            // Fetch employees
            const employeesRes = await axios.get('/api/employees');
            const totalEmployees = employeesRes.data.length;

            setStats({
                todayRevenue,
                todayOrders: todayOrders.length,
                pendingOrders,
                lowStockItems,
                totalMenuItems,
                totalEmployees
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}><h2>LOADING DASHBOARD...</h2></div>;
    }

    return (
        <div className="page-container" style={{ paddingTop: '40px', position: 'relative' }}>
            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
            {alertMsg && (
                <div style={{
                    position: 'fixed',
                    top: '30px',
                    right: '30px',
                    padding: '20px 30px',
                    background: alertMsg.type === 'success' ? '#44ff44' : '#ff4444',
                    border: '4px solid black',
                    boxShadow: '10px 10px 0 0 black',
                    zIndex: 9999,
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    animation: 'slideIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                    color: alertMsg.type === 'success' ? 'black' : 'white'
                }}>
                    {alertMsg.message}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmation}
                title={confirmation?.message || ''}
                message=""
                confirmText="YES"
                cancelText="NO"
                onConfirm={() => {
                    confirmation?.onConfirm();
                    setConfirmation(null);
                }}
                onCancel={() => setConfirmation(null)}
                variant="primary"
            />

            {/* Header */}
            <PageHeader
                title="DASHBOARD"
                description="SHOP OVERVIEW & PERFORMANCE"
                icon={TrendingUp}
                color="#c7d2fe"
            />

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Attendance Widget */}
                <AttendanceWidget
                    attendance={attendance}
                    currentTime={currentTime}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                />

                {/* Team Notes Widget */}
                <TeamNotesWidget
                    noteContent={noteContent}
                    setNoteContent={setNoteContent}
                    originalNoteContent={originalNoteContent}
                    setOriginalNoteContent={setOriginalNoteContent}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isManager={isManager}
                    onSave={handleSaveNote}
                    isHover={isNoteHover}
                    setIsHover={setIsNoteHover}
                />


                {/* Stats Cards */}
                <StatsCard title="TODAY'S REVENUE" value={stats.todayRevenue} icon={DollarSign} color="var(--success-color)" />
                <StatsCard title="TODAY'S ORDERS" value={stats.todayOrders} icon={ShoppingBag} color="var(--primary-color)" />
                <StatsCard title="PENDING ORDERS" value={stats.pendingOrders} icon={ChefHat} color="var(--accent-color)" textColor="black" />
                <StatsCard
                    title="LOW STOCK ITEMS"
                    value={stats.lowStockItems}
                    icon={AlertTriangle}
                    color={stats.lowStockItems > 0 ? 'var(--danger-color)' : 'var(--neutral-color)'}
                    textColor={stats.lowStockItems > 0 ? 'white' : 'black'}
                />
                <StatsCard title="MENU ITEMS" value={stats.totalMenuItems} icon={Package} color="var(--secondary-color)" />
                <StatsCard title="TOTAL STAFF" value={stats.totalEmployees} icon={Users} color="var(--neutral-color)" textColor="black" />
            </div>


            {/* Weekly Shift Schedule Widget */}
            <WeeklyShiftSchedule weeklyShifts={weeklyShifts} />



            {/* BRUTALIST LATE MODAL */}
            {lateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: '#ef4444',
                        border: '6px solid black',
                        boxShadow: '15px 15px 0 0 black',
                        padding: '40px',
                        maxWidth: '600px',
                        width: '90%',
                        textAlign: 'center',
                        animation: 'shake 0.5s'
                    }}>
                        <div style={{ background: 'black', color: 'white', padding: '10px', display: 'inline-block', marginBottom: '20px', fontWeight: 'bold' }}>
                            ATTENDANCE ALERT
                        </div>
                        <h1 style={{ fontSize: '3.5rem', margin: '0 0 20px 0', textTransform: 'uppercase', lineHeight: 1, textShadow: '4px 4px 0 black', color: 'white' }}>
                            {lateModal.message}
                        </h1>
                        <div style={{ background: 'white', border: '4px solid black', padding: '20px', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {lateModal.details}
                        </div>
                        <button
                            onClick={() => setLateModal(null)}
                            style={{
                                marginTop: '30px',
                                background: 'black',
                                color: 'white',
                                border: 'none',
                                padding: '20px 50px',
                                fontSize: '1.5rem',
                                fontWeight: '900',
                                cursor: 'pointer',
                                boxShadow: '5px 5px 0 0 white',
                                transition: 'transform 0.1s'
                            }}
                            onMouseOver={e => e.target.style.transform = 'translate(-2px, -2px)'}
                            onMouseOut={e => e.target.style.transform = 'translate(0, 0)'}
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
