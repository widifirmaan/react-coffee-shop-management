import { Clock } from 'lucide-react';

export const AttendanceWidget = ({ attendance, currentTime, onClockIn, onClockOut }) => {
    return (
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
                        onClick={onClockIn}
                        disabled={!!attendance}
                        style={{
                            width: '100%', padding: '10px',
                            background: attendance ? '#e5e7eb' : 'black',
                            color: attendance ? '#9ca3af' : 'white',
                            border: 'none', fontWeight: '900', cursor: attendance ? 'default' : 'pointer',
                            boxShadow: attendance ? 'none' : '4px 4px 0 0 rgba(0,0,0,0.2)',
                            fontSize: '1rem'
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
                        onClick={onClockOut}
                        disabled={!attendance || !!attendance.clockOutTime}
                        style={{
                            width: '100%', padding: '10px',
                            background: (!attendance || attendance.clockOutTime) ? '#e5e7eb' : 'black',
                            color: (!attendance || attendance.clockOutTime) ? '#9ca3af' : 'white',
                            border: 'none', fontWeight: '900', cursor: (!attendance || attendance.clockOutTime) ? 'default' : 'pointer',
                            boxShadow: (!attendance || attendance.clockOutTime) ? 'none' : '4px 4px 0 0 rgba(0,0,0,0.2)',
                            fontSize: '1rem'
                        }}
                    >
                        OUT
                    </button>
                </div>
            </div>
        </div>
    );
};
