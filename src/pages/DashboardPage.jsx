import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package, ChefHat, AlertTriangle, Calendar, Clock, StickyNote, Save, Bell } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
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
    const [lateModal, setLateModal] = useState(null);
    const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
    const [scheduleCurrentPage, setScheduleCurrentPage] = useState(1);
    const scheduleItemsPerPage = 5;
    const [todayShift, setTodayShift] = useState(null);



    // Schedule Helper
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const getWeekDates = () => {
        const d = new Date();
        const dayIdx = d.getDay(); // 0=Sun
        const currentDayIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        const diff = d.getDate() - currentDayIdx;
        const monday = new Date(d.setDate(diff));
        const weekDates = {};
        days.forEach((day, i) => {
            const nd = new Date(monday);
            nd.setDate(monday.getDate() + i);
            weekDates[day] = nd.toLocaleDateString('en-CA');
        });
        return weekDates;
    };
    const weekDates = getWeekDates();

    // Helper for case-insensitive role check
    const isManager = user && user.role && user.role.toUpperCase() === 'MANAGER';
    const isWaiter = user?.role && ['WAITER', 'MANAGER'].includes(user.role.toUpperCase());

    useEffect(() => {
        fetchDashboardData();
        checkAttendance();
        fetchNote();
        fetchShiftData();
        fetchTodayShift();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(timer);
        };
    }, [user]);



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

    const fetchTodayShift = async () => {
        if (!user || !user.username) return;
        try {
            // First, get the employee data to map username to employeeId
            const empRes = await axios.get('/api/employees');
            const currentEmployee = empRes.data.find(e => e.username === user.username);

            if (!currentEmployee) {
                console.error('Employee not found for user:', user.username);
                return;
            }

            const shiftRes = await axios.get('/api/shifts');
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            const userShift = shiftRes.data.find(s => s.employeeId === currentEmployee.employeeId && s.dayOfWeek === today);
            setTodayShift(userShift);
        } catch (e) {
            console.error('Failed to fetch today shift', e);
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
        if (!user || !user.username) return;
        try {
            // Fetch employee data to get correct employeeId
            const empRes = await axios.get('/api/employees');
            const currentEmployee = empRes.data.find(e => e.username === user.username);

            if (!currentEmployee) {
                console.log('Employee not found for user:', user.username);
                return;
            }

            const res = await axios.get(`/api/attendance/today/${currentEmployee.employeeId}`);
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
                    // Fetch employee data to get correct employeeId
                    const empRes = await axios.get('/api/employees');
                    const currentEmployee = empRes.data.find(e => e.username === user.username);

                    if (!currentEmployee) {
                        setAlertMsg({ type: 'error', message: 'EMPLOYEE NOT FOUND!' });
                        setConfirmation(null);
                        return;
                    }

                    const payload = {
                        employeeId: currentEmployee.employeeId,
                        employeeName: currentEmployee.name
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

                        if (res.data.status === 'LATE') {
                            setLateModal({
                                type: 'late',
                                message: 'LATE ARRIVAL DETECTED!',
                                details: 'YOU ARE LATE! PLEASE EXPLAIN TO MANAGER.'
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
                    // Fetch employee data to get correct employeeId
                    const empRes = await axios.get('/api/employees');
                    const currentEmployee = empRes.data.find(e => e.username === user.username);

                    if (!currentEmployee) {
                        setAlertMsg({ type: 'error', message: 'EMPLOYEE NOT FOUND!' });
                        setConfirmation(null);
                        return;
                    }

                    const res = await axios.post('/api/attendance/clock-out', { employeeId: currentEmployee.employeeId });

                    if (res.data && res.data.status_alert === 'TOO_EARLY') {
                        setLateModal({
                            type: 'early',
                            message: 'TOO EARLY!',
                            details: 'YOU CANNOT CLOCK OUT BEFORE YOUR SHIFT ENDS!'
                        });
                        setAlertMsg({ type: 'error', message: 'SHIFT INCOMPLETE!' });
                        setAttendance(res.data);
                        fetchShiftData();
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
            <Alert
                type={alertMsg?.type}
                message={alertMsg?.message}
                onClose={() => setAlertMsg(null)}
            />

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

            {/* NOTIFICATIONS WIDGET */}


            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Attendance Widget */}
                <Card style={{ background: '#67e8f9', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={24} /> ATTENDANCE
                        </h2>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8, background: 'black', color: 'white', padding: '4px 8px', borderRadius: '0', fontWeight: 'bold' }}>
                            {currentTime.toLocaleDateString()}
                        </span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '3.5rem', margin: 0, fontFamily: 'monospace', letterSpacing: '-2px', lineHeight: 1 }}>
                            {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>:{currentTime.getSeconds().toString().padStart(2, '0')}</span>
                        </h1>
                    </div>

                    {todayShift && todayShift.shiftType !== 'OFF' && (
                        <div style={{
                            background: 'rgba(0,0,0,0.1)',
                            padding: '8px',
                            marginBottom: '15px',
                            border: '2px solid black',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 'bold', marginBottom: '2px' }}>YOUR SHIFT TODAY</div>
                            <div style={{ fontSize: '1rem', fontWeight: '900' }}>
                                {todayShift.shiftType === 'MORNING' && '07:00 - 15:00'}
                                {todayShift.shiftType === 'AFTERNOON' && '15:00 - 23:00'}
                                {todayShift.shiftType === 'EVENING' && '23:00 - 07:00'}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', border: '2px solid black', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7, fontWeight: 'bold' }}>START SHIFT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#15803d', fontFamily: 'monospace' }}>
                                {attendance?.clockInTime ? new Date(attendance.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                            <Button
                                onClick={handleClockIn}
                                disabled={!!attendance}
                                variant={attendance ? 'secondary' : 'primary'}
                                style={{ width: '100%', fontSize: '1rem', padding: '10px' }}
                            >
                                IN
                            </Button>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', border: '2px solid black', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7, fontWeight: 'bold' }}>END SHIFT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#b91c1c', fontFamily: 'monospace' }}>
                                {attendance?.clockOutTime ? new Date(attendance.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                            <Button
                                onClick={handleClockOut}
                                disabled={!attendance || !!attendance.clockOutTime}
                                variant={(!attendance || attendance.clockOutTime) ? 'secondary' : 'primary'}
                                style={{ width: '100%', fontSize: '1rem', padding: '10px' }}
                            >
                                OUT
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Team Notes Widget */}
                <Card
                    style={{
                        background: '#fef08a', color: 'black', position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '60px', background: 'rgba(0,0,0,0.05)', borderBottom: '2px solid black' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', opacity: 0.8 }}>
                            <StickyNote size={20} /> TEAM NOTES
                        </h3>
                        {isEditing && isManager && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <Button
                                    onClick={() => {
                                        setNoteContent(originalNoteContent);
                                        setIsEditing(false);
                                    }}
                                    variant="secondary"
                                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    onClick={handleSaveNote}
                                    variant="primary"
                                    style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Save size={14} /> SAVE
                                </Button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <textarea
                            autoFocus
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            style={{
                                width: '100%',
                                height: '200px',
                                background: 'white',
                                border: '2px solid black',
                                padding: '10px',
                                resize: 'none',
                                outline: 'none',
                                fontSize: '1rem',
                                fontFamily: 'monospace',
                                lineHeight: '1.5',
                                color: 'black',
                                position: 'relative',
                                zIndex: 1,
                                caretColor: 'black'
                            }}
                            placeholder="Type something..."
                        />
                    ) : (
                        <div
                            onClick={() => isManager && setIsEditing(true)}
                            title={isManager ? "Click to edit" : ""}
                            style={{
                                width: '100%',
                                height: '200px',
                                overflowY: 'auto',
                                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                                fontSize: '1.2rem',
                                lineHeight: '1.5',
                                color: '#333',
                                cursor: isManager ? 'pointer' : 'default',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {noteContent || (
                                <span style={{ opacity: 0.5, fontStyle: 'italic' }}>
                                    {isManager ? "Tap here to write a note..." : "No notes from manager."}
                                </span>
                            )}
                        </div>
                    )}

                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'right', marginTop: '5px' }}>
                        {isEditing ? 'Editing mode' : (isManager ? 'Tap text to edit' : 'Read-only')}
                    </div>
                </Card>


                {/* Stats Cards */}
                {/* Unified Stats Card */}
                <Card style={{ background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '4px solid black', paddingBottom: '10px' }}>
                        <TrendingUp size={24} />
                        <h3 style={{ margin: 0 }}>PERFORMANCE</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {/* Revenue */}
                        <div style={{ background: 'var(--success-color)', color: 'white', padding: '15px', border: '2px solid black', boxShadow: '4px 4px 0 0 black' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 'bold' }}>REVENUE</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>Rp {stats.todayRevenue.toLocaleString()}</div>
                        </div>
                        {/* Orders */}
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '15px', border: '2px solid black', boxShadow: '4px 4px 0 0 black' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 'bold' }}>ORDERS</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>{stats.todayOrders}</div>
                        </div>
                        {/* Pending */}
                        <div style={{ background: 'var(--accent-color)', color: 'black', padding: '15px', border: '2px solid black', boxShadow: '4px 4px 0 0 black' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'bold' }}>PENDING</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>{stats.pendingOrders}</div>
                        </div>
                        {/* Low Stock */}
                        <div style={{ background: stats.lowStockItems > 0 ? 'var(--danger-color)' : 'var(--neutral-color)', color: stats.lowStockItems > 0 ? 'white' : 'black', padding: '15px', border: '2px solid black', boxShadow: '4px 4px 0 0 black' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'bold' }}>LOW STOCK</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>{stats.lowStockItems}</div>
                        </div>
                    </div>
                </Card>
            </div>






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
