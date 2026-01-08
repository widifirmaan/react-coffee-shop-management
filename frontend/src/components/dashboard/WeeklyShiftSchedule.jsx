import { Calendar } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';

export const WeeklyShiftSchedule = ({ weeklyShifts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // Calculate Week Dates
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

    return (
        <div className="card" style={{ marginBottom: '40px', background: 'white', border: '4px solid black', boxShadow: '8px 8px 0 0 black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
                <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
                    <Calendar size={28} /> WEEKLY SHIFT SCHEDULE
                </h2>
                <div style={{ width: '300px' }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
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
                        {weeklyShifts.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp, idx) => {
                            return (
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
                                            <Td key={day} style={{ textAlign: 'center', borderRight: border, background: bg, position: 'relative' }}>
                                                {shiftType !== 'OFF' && (
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                                        {shiftType.substring(0, 4)}
                                                    </div>
                                                )}
                                                {icon && <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</div>}
                                            </Td>
                                        );
                                    })}
                                </Tr>
                            );
                        })}
                        {weeklyShifts.length === 0 && (
                            <Tr>
                                <Td colSpan="8" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>LOADING WEEKLY SCHEDULE...</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
            <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#bae6fd', border: '1px solid black' }}></span> MORNING (07-15)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#fde047', border: '1px solid black' }}></span> AFTERNOON (15-23)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#fda4af', border: '1px solid black' }}></span> EVENING (23-07)</div>
            </div>
        </div>
    );
};
