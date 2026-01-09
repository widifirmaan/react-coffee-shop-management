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

    const [notifications, setNotifications] = useState([]);

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
    const isManager = user && (user.role === 'MANAGER' || user.role === 'manager');
    const isWaiter = user && (['WAITER', 'waiter', 'MANAGER', 'manager'].includes(user.role));

    useEffect(() => {
        fetchDashboardData();
        checkAttendance();
        fetchNote();
        fetchShiftData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        let notifInterval;
        if (isWaiter) {
            fetchNotifications();
            notifInterval = setInterval(fetchNotifications, 5000);
        }

        return () => {
            clearInterval(timer);
            if (notifInterval) clearInterval(notifInterval);
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data);
        } catch (e) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (e) {
            console.error("Failed to mark read");
        }
    };

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
            {isWaiter && notifications.length > 0 && (
                <div style={{ marginBottom: '40px', background: '#fee2e2', border: '4px solid #dc2626', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <Bell size={32} color="#dc2626" className={notifications.length > 0 ? 'animate-pulse' : ''} />
                        <h2 style={{ margin: 0, color: '#991b1b', fontWeight: '900', textTransform: 'uppercase' }}>WAITER REQUESTS ({notifications.length})</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                        {notifications.map(n => (
                            <div key={n.id} style={{ background: 'white', border: '2px solid #b91c1c', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '4px 4px 0 0 #b91c1c' }}>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#b91c1c' }}>{n.tableNumber}</div>
                                    <div style={{ fontWeight: 'bold' }}>{n.message}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <Button variant="danger" onClick={() => markAsRead(n.id)} style={{ padding: '10px' }}>RESOLVE</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40px', background: 'rgba(0,0,0,0.05)', borderBottom: '2px solid black' }}></div>
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
                {[
                    { title: "TODAY'S REVENUE", value: stats.todayRevenue, icon: DollarSign, color: "var(--success-color)", text: "white" },
                    { title: "TODAY'S ORDERS", value: stats.todayOrders, icon: ShoppingBag, color: "var(--primary-color)", text: "white" },
                    { title: "PENDING ORDERS", value: stats.pendingOrders, icon: ChefHat, color: "var(--accent-color)", text: "black" },
                    {
                        title: "LOW STOCK ITEMS",
                        value: stats.lowStockItems,
                        icon: AlertTriangle,
                        color: stats.lowStockItems > 0 ? 'var(--danger-color)' : 'var(--neutral-color)',
                        text: stats.lowStockItems > 0 ? 'white' : 'black'
                    },
                    { title: "MENU ITEMS", value: stats.totalMenuItems, icon: Package, color: "var(--secondary-color)", text: "white" },
                    { title: "TOTAL STAFF", value: stats.totalEmployees, icon: Users, color: "var(--neutral-color)", text: "black" }
                ].map((stat, i) => (
                    <Card key={i} style={{ background: stat.color, color: stat.text }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: stat.text === 'white' ? 0.9 : 0.7 }}>{stat.title}</p>
                                <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                                    {typeof stat.value === 'number' && stat.title.includes('REVENUE') ? `Rp ${stat.value.toLocaleString()}` : stat.value}
                                </h2>
                            </div>
                            <stat.icon size={40} />
                        </div>
                    </Card>
                ))}
            </div>


            {/* Weekly Shift Schedule Widget */}
            <Card style={{ marginBottom: '40px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
                    <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
                        <Calendar size={28} /> WEEKLY SHIFT SCHEDULE
                    </h2>
                    <div style={{ width: '300px' }}>
                        <SearchBar
                            value={scheduleSearchTerm}
                            onChange={setScheduleSearchTerm}
                            placeholder="FIND STAFF..."
                        />
                    </div>
                </div>

                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th style={{ position: 'sticky', left: 0, background: 'black', zIndex: 10, minWidth: '150px' }}>STAFF</Th>
                                {days.map(day => {
                                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === day;
                                    return (
                                        <Th key={day} style={{
                                            textAlign: 'center',
                                            background: isToday ? '#facc15' : 'black',
                                            color: isToday ? 'black' : 'white',
                                            width: '12%',
                                            minWidth: '100px'
                                        }}>
                                            {day.substring(0, 3)}
                                        </Th>
                                    );
                                })}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {(() => {
                                const filtered = weeklyShifts.filter(emp => emp.name.toLowerCase().includes(scheduleSearchTerm.toLowerCase()));
                                const paginated = filtered.slice((scheduleCurrentPage - 1) * scheduleItemsPerPage, scheduleCurrentPage * scheduleItemsPerPage);

                                if (filtered.length === 0 && weeklyShifts.length === 0) return <Tr><Td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>LOADING...</Td></Tr>;
                                if (filtered.length === 0) return <Tr><Td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>NO STAFF FOUND</Td></Tr>;

                                return paginated.map((emp, idx) => (
                                    <Tr key={emp.id} index={idx}>
                                        <Td style={{
                                            borderRight: '2px solid black', fontWeight: 'bold',
                                            position: 'sticky', left: 0, background: idx % 2 === 0 ? 'white' : '#f9fafb', zIndex: 10
                                        }}>
                                            {emp.name}
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{emp.position}</div>
                                        </Td>
                                        {days.map(day => {
                                            const dateStr = weekDates[day];
                                            const att = emp.attendanceHistory ? emp.attendanceHistory[dateStr] : null;
                                            const shiftType = emp.schedule[day] || 'OFF';
                                            const isTodayHeader = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === day;

                                            let icon = null;
                                            let bg = isTodayHeader ? '#fffbeb' : 'inherit';
                                            let border = '1px solid #ddd';

                                            if (shiftType !== 'OFF') {
                                                const now = new Date();
                                                const cellDate = new Date(dateStr);
                                                let startH = 7;
                                                if (shiftType === 'AFTERNOON') startH = 15;
                                                if (shiftType === 'EVENING') startH = 23;

                                                const shiftStart = new Date(cellDate);
                                                shiftStart.setHours(startH, 0, 0, 0);
                                                const shiftEnd = new Date(shiftStart);
                                                shiftEnd.setHours(shiftStart.getHours() + 8);
                                                const graceLimit = new Date(shiftStart);
                                                graceLimit.setMinutes(graceLimit.getMinutes() + 15);

                                                if (att && att.status === 'COMPLETED') {
                                                    if (att.checkInStatus === 'LATE') { icon = '⏰'; bg = '#fde047'; }
                                                    else { icon = '✅'; bg = '#86efac'; }
                                                } else if (att && att.status === 'WORKING') {
                                                    if (now > shiftEnd) { icon = '🚪'; bg = '#fde047'; }
                                                    else if (att.checkInStatus === 'LATE') { icon = '⏳'; bg = '#fde047'; }
                                                    else { icon = '🚀'; bg = '#86efac'; }
                                                } else {
                                                    if (now > graceLimit && now.getDate() >= cellDate.getDate()) { icon = '❌'; bg = '#fca5a5'; }
                                                }
                                            } else {
                                                bg = '#f3f4f6';
                                            }

                                            return (
                                                <Td key={day} style={{ textAlign: 'center', borderRight: border, background: bg }}>
                                                    {shiftType !== 'OFF' && <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>{shiftType.substring(0, 4)}</div>}
                                                    {icon && <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</div>}
                                                </Td>
                                            );
                                        })}
                                    </Tr>
                                ));
                            })()}
                        </Tbody>
                    </Table>
                </TableContainer>

                {weeklyShifts.length > 0 && (
                    <Pagination
                        currentPage={scheduleCurrentPage}
                        totalPages={Math.ceil(weeklyShifts.filter(emp => emp.name.toLowerCase().includes(scheduleSearchTerm.toLowerCase())).length / scheduleItemsPerPage)}
                        onPageChange={setScheduleCurrentPage}
                        itemsPerPage={scheduleItemsPerPage}
                        totalItems={weeklyShifts.filter(emp => emp.name.toLowerCase().includes(scheduleSearchTerm.toLowerCase())).length}
                    />
                )}

                <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#bae6fd', border: '1px solid black' }}></span> MORNING (07-15)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#fde047', border: '1px solid black' }}></span> AFTERNOON (15-23)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#fda4af', border: '1px solid black' }}></span> EVENING (23-07)</div>
                </div>
            </Card>



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
