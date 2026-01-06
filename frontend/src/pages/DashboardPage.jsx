import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package, ChefHat, AlertTriangle, Clock, StickyNote, Save, Calendar } from 'lucide-react';

export default function DashboardPage({ user }) {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalMenuItems: 0,
        totalEmployees: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
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
            const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
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

            // Get recent orders (last 5)
            setRecentOrders(orders.slice(0, 5));
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
        <div style={{ padding: '20px', position: 'relative' }}>
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

            {confirmation && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', zIndex: 10000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        background: 'white', padding: '30px', border: '4px solid black',
                        boxShadow: '15px 15px 0 0 black', maxWidth: '400px', width: '90%', textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '30px', textTransform: 'uppercase' }}>{confirmation.message}</h2>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <button
                                onClick={confirmation.onConfirm}
                                style={{
                                    flex: 1, padding: '15px', background: 'black', color: 'white',
                                    border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={e => e.target.style.transform = 'translate(2px, 2px)'}
                                onMouseUp={e => e.target.style.transform = 'none'}
                            >YES</button>
                            <button
                                onClick={() => setConfirmation(null)}
                                style={{
                                    flex: 1, padding: '15px', background: 'white', color: 'black',
                                    border: '4px solid black', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={e => e.target.style.transform = 'translate(2px, 2px)'}
                                onMouseUp={e => e.target.style.transform = 'none'}
                            >NO</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>DASHBOARD</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Welcome back, {user.name || user.username}!</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Attendance Widget */}
                <div className="card" style={{ background: '#67e8f9', color: 'black', border: '4px solid black' }}>
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
                        {/* Clock In Section */}
                        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', border: '2px solid black', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7, fontWeight: 'bold' }}>START SHIFT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#15803d', fontFamily: 'monospace' }}>
                                {attendance?.clockInTime ? new Date(attendance.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                            <button
                                onClick={handleClockIn}
                                disabled={!!attendance}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: attendance ? '#e5e7eb' : 'black',
                                    color: attendance ? '#9ca3af' : 'white',
                                    border: 'none', fontWeight: '900', cursor: attendance ? 'default' : 'pointer',
                                    opacity: attendance ? 1 : 1,
                                    boxShadow: attendance ? 'none' : '4px 4px 0 0 rgba(0,0,0,0.2)'
                                }}
                            >
                                IN
                            </button>
                        </div>

                        {/* Clock Out Section */}
                        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', border: '2px solid black', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7, fontWeight: 'bold' }}>END SHIFT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#b91c1c', fontFamily: 'monospace' }}>
                                {attendance?.clockOutTime ? new Date(attendance.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                            <button
                                onClick={handleClockOut}
                                disabled={!attendance || !!attendance.clockOutTime}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: (!attendance || attendance.clockOutTime) ? '#e5e7eb' : 'black',
                                    color: (!attendance || attendance.clockOutTime) ? '#9ca3af' : 'white',
                                    border: 'none', fontWeight: '900', cursor: (!attendance || attendance.clockOutTime) ? 'default' : 'pointer',
                                    opacity: (!attendance || attendance.clockOutTime) ? 1 : 1,
                                    boxShadow: (!attendance || attendance.clockOutTime) ? 'none' : '4px 4px 0 0 rgba(0,0,0,0.2)'
                                }}
                            >
                                OUT
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky Note Widget */}
                <div
                    className="card"
                    onMouseEnter={() => setIsNoteHover(true)}
                    onMouseLeave={() => setIsNoteHover(false)}
                    style={{
                        background: '#fef08a', color: 'black', border: '4px solid black', position: 'relative',
                        transform: isNoteHover ? 'translate(-4px, -4px)' : 'none',
                        boxShadow: isNoteHover ? '12px 12px 0 0 black' : '8px 8px 0 0 black',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40px', background: 'rgba(0,0,0,0.05)', borderBottom: '2px solid black' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', opacity: 0.8 }}>
                            <StickyNote size={20} /> TEAM NOTES
                        </h3>
                        {isEditing && isManager && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={() => {
                                        setNoteContent(originalNoteContent);
                                        setIsEditing(false);
                                        setIsNoteDirty(false);
                                    }}
                                    style={{ background: 'white', color: 'black', border: '2px solid black', padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    CANCEL
                                </button>
                                <button onClick={handleSaveNote} style={{ background: 'black', color: 'white', border: '2px solid black', padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                    <Save size={14} /> SAVE
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <textarea
                            autoFocus
                            value={noteContent}
                            onChange={(e) => {
                                setNoteContent(e.target.value);
                                setIsNoteDirty(true);
                            }}
                            style={{
                                width: '100%',
                                height: '200px',
                                background: 'white', // Standard textbox look
                                border: '2px solid black',
                                padding: '10px',
                                resize: 'none',
                                outline: 'none',
                                fontSize: '1rem',
                                fontFamily: 'monospace', // Standard font for editing
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
                </div>

                {/* Today Revenue */}
                <div className="card" style={{ background: 'var(--success-color)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>TODAY'S REVENUE</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>Rp {stats.todayRevenue.toLocaleString()}</h2>
                        </div>
                        <DollarSign size={40} />
                    </div>
                </div>

                {/* Today Orders */}
                <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>TODAY'S ORDERS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.todayOrders}</h2>
                        </div>
                        <ShoppingBag size={40} />
                    </div>
                </div>

                {/* Pending Orders */}
                <div className="card" style={{ background: 'var(--accent-color)', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>PENDING ORDERS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.pendingOrders}</h2>
                        </div>
                        <ChefHat size={40} />
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="card" style={{ background: stats.lowStockItems > 0 ? 'var(--danger-color)' : 'var(--neutral-color)', color: stats.lowStockItems > 0 ? 'white' : 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: stats.lowStockItems > 0 ? 0.9 : 0.7 }}>LOW STOCK ITEMS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.lowStockItems}</h2>
                        </div>
                        <AlertTriangle size={40} />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="card" style={{ background: 'var(--secondary-color)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>MENU ITEMS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.totalMenuItems}</h2>
                        </div>
                        <Package size={40} />
                    </div>
                </div>

                {/* Total Employees */}
                <div className="card" style={{ background: 'var(--neutral-color)', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>TOTAL STAFF</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.totalEmployees}</h2>
                        </div>
                        <Users size={40} />
                    </div>
                </div>
            </div>

            {/* Weekly Shift Schedule Widget */}
            <div className="card" style={{ marginBottom: '40px', background: 'white', border: '4px solid black', boxShadow: '8px 8px 0 0 black' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
                    <Calendar size={28} /> WEEKLY SHIFT SCHEDULE
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '4px solid black', minWidth: '800px' }}>
                        <thead style={{ background: 'black', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', borderRight: '2px solid white', position: 'sticky', left: 0, background: 'black', zIndex: 10 }}>STAFF</th>
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === day;
                                    return (
                                        <th key={day} style={{
                                            padding: '10px', textAlign: 'center', borderRight: '2px solid white',
                                            background: isToday ? '#facc15' : 'black', // Highlight Today
                                            color: isToday ? 'black' : 'white',
                                            width: '12%'
                                        }}>
                                            {day.substring(0, 3)}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyShifts.map((emp, idx) => {
                                // Calculate Week Dates
                                const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                                const d = new Date();
                                const dayIdx = d.getDay(); // 0=Sun
                                // Adjust to Monday base (If Sun(0) -> -6. If Tue(2) -> diff = 1)
                                // Current date - (dayIdx - 1)
                                const currentDayIdx = dayIdx === 0 ? 6 : dayIdx - 1;
                                const diff = d.getDate() - currentDayIdx;
                                const monday = new Date(d.setDate(diff));
                                const weekDates = {};
                                days.forEach((day, i) => {
                                    const nd = new Date(monday);
                                    nd.setDate(monday.getDate() + i);
                                    weekDates[day] = nd.toLocaleDateString('en-CA');
                                });

                                return (
                                    <tr key={emp.id} style={{ borderBottom: '2px solid black', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                                        <td style={{
                                            padding: '10px', borderRight: '2px solid black', fontWeight: 'bold',
                                            position: 'sticky', left: 0, background: idx % 2 === 0 ? 'white' : '#f9fafb', zIndex: 10
                                        }}>
                                            {emp.name}
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{emp.position}</div>
                                        </td>
                                        {days.map(day => {
                                            const dateStr = weekDates[day];
                                            const att = emp.attendanceHistory ? emp.attendanceHistory[dateStr] : null;
                                            const shiftType = emp.schedule[day] || 'OFF';
                                            const isTodayHeader = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === day;

                                            // LOGIC VISUALISASI
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
                                                    // 1. COMPLETED
                                                    if (att.checkInStatus === 'LATE') { icon = '⏰'; bg = '#fde047'; }
                                                    else { icon = '✅'; bg = '#86efac'; }
                                                } else if (att && att.status === 'WORKING') {
                                                    // 2. WORKING
                                                    if (now > shiftEnd) { icon = '🚪'; bg = '#fde047'; }
                                                    else if (att.checkInStatus === 'LATE') { icon = '⏳'; bg = '#fde047'; }
                                                    else { icon = '🚀'; bg = '#86efac'; }
                                                } else {
                                                    // 3. NO RECORD (Future or Absent)
                                                    if (now > graceLimit) { icon = '❌'; bg = '#fca5a5'; } // Absent
                                                    else if (now < shiftStart) { icon = null; } // Future
                                                    else { icon = null; } // In Grace Period / Just pre-shift
                                                }
                                            } else {
                                                bg = '#f3f4f6'; // OFF Color
                                            }

                                            return (
                                                <td key={day} style={{ padding: '10px', textAlign: 'center', borderRight: border, background: bg, position: 'relative' }}>
                                                    {shiftType !== 'OFF' && (
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                                            {shiftType.substring(0, 4)}
                                                        </div>
                                                    )}
                                                    {icon && <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</div>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )
                            })}
                            {weeklyShifts.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>LOADING WEEKLY SCHEDULE...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#bae6fd', border: '1px solid black' }}></span> MORNING (07-15)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#fde047', border: '1px solid black' }}></span> AFTERNOON (15-23)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#fda4af', border: '1px solid black' }}></span> EVENING (23-07)</div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={28} />
                    RECENT ORDERS
                </h2>
                {recentOrders.length === 0 ? (
                    <p style={{ opacity: 0.5, textAlign: 'center', padding: '40px' }}>NO RECENT ORDERS</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '4px solid black' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ORDER ID</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>CUSTOMER</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>TABLE</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ITEMS</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>TOTAL</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>STATUS</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '2px solid #e0e0e0' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{order.id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '15px' }}>{order.customerName}</td>
                                        <td style={{ padding: '15px' }}>{order.tableNumber}</td>
                                        <td style={{ padding: '15px' }}>{order.items.length} items</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>Rp {order.totalAmount.toLocaleString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span className={`badge ${order.status === 'COMPLETED' ? 'success' : order.status === 'PENDING' ? '' : 'danger'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', opacity: 0.7 }}>
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
