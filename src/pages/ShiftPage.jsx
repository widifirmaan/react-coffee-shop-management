import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Save, Trash2, Plus, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING'];

export default function ShiftPage() {
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null); // { day, shift }

    // For Modal
    const [employeeToAdd, setEmployeeToAdd] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [shiftRes, empRes] = await Promise.all([
                axios.get('/api/shifts'),
                axios.get('/api/employees')
            ]);
            setShifts(shiftRes.data);
            setEmployees(empRes.data.filter(e => e.active)); // Only active employees
        } catch (e) {
            console.error(e);
            setAlertMsg({ type: 'error', message: 'FAILED TO LOAD DATA' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = (empId, day, shiftType) => {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return;

        // check if already added
        const exists = shifts.some(s =>
            s.dayOfWeek === day &&
            s.shiftType === shiftType &&
            s.employeeId === emp.employeeId
        );

        if (exists) {
            // alert('Employee already in this shift!'); // Silent ignore on DnD
            return;
        }

        // Limit to 5 staff per shift
        const currentShifts = shifts.filter(s => s.dayOfWeek === day && s.shiftType === shiftType);
        if (currentShifts.length >= 5) {
            setAlertMsg({ type: 'error', message: 'MAX 5 STAFF PER SHIFT!' });
            return;
        }

        const newShift = {
            employeeId: emp.employeeId,
            employeeName: emp.name,
            role: emp.role, // Added for validation
            position: emp.position,
            dayOfWeek: day,
            shiftType: shiftType
        };

        setShifts(prev => [...prev, newShift]);
    };

    const handleRemove = (shiftToRemove) => {
        setShifts(shifts.filter(s => s !== shiftToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Validation: Every shift must have at least one staff member
        for (const day of DAYS) {
            for (const shiftType of SHIFTS) {
                const shiftStaff = getShiftsFor(day, shiftType);
                
                // Strict 5-Role Validation
                const requiredRoles = ['MANAGER', 'BARISTA', 'CASHIER', 'KITCHEN STAFF', 'WAITER'];
                const currentRoles = shiftStaff.map(s => s.role?.toUpperCase());
                const missingRoles = requiredRoles.filter(role => !currentRoles.includes(role));

                if (missingRoles.length > 0) {
                    setAlertMsg({ 
                        type: 'error', 
                        message: `Shift ${shiftType} pada ${day} kekurangan: ${missingRoles.join(', ')}` 
                    });
                    setIsSaving(false);
                    return;
                }
            }
        }

        try {
            await axios.post('/api/shifts', shifts);
            setAlertMsg({ type: 'success', message: 'SCHEDULE SAVED!' });
        } catch (e) {
            console.error(e);
            const errMsg = e.response?.data?.message || 'SAVE FAILED';
            setAlertMsg({ type: 'error', message: errMsg });
        } finally {
            setIsSaving(false);
        }
    };

    const getShiftsFor = (day, shiftType) => {
        return shifts.filter(s => s.dayOfWeek === day && s.shiftType === shiftType);
    };

    // Validation
    const validateShift = (day, shiftType) => {
        const currentShifts = getShiftsFor(day, shiftType);
        if (currentShifts.length === 0) return { type: 'error', msg: 'KOSONG' };
        
        const requiredRoles = ['MANAGER', 'BARISTA', 'CASHIER', 'KITCHEN STAFF', 'WAITER'];
        const currentRoles = currentShifts.map(s => s.role?.toUpperCase());
        const missingCount = requiredRoles.filter(role => !currentRoles.includes(role)).length;
        
        if (missingCount > 0) return { type: 'error', msg: `${missingCount} ROLE KURANG` };
        
        return { type: 'ok', msg: 'LENGKAP' };
    };

    // DnD Handlers
    const handleDragStart = (e, employee) => {
        e.dataTransfer.setData('employeeId', employee.id);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.style.background = '#e0e7ff'; // Highlight
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.style.background = 'white'; // Reset
    };

    const handleDrop = (e, day, shiftType) => {
        e.preventDefault();
        e.currentTarget.style.background = 'white';
        const empId = e.dataTransfer.getData('employeeId');
        if (empId) {
            handleAdd(empId, day, shiftType);
        }
    };

    if (loading) return <div className="page-container">LOADING...</div>;

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
            <PageHeader
                title="WEEKLY SHIFT MANAGER"
                description="DRAG & DROP STAFF TO ASSIGN SHIFTS"
                icon={Calendar}
                color="#c4b5fd"
                action={
                    <Button onClick={handleSave} disabled={isSaving} variant="primary" style={{ padding: '15px 30px', fontSize: '1.2rem' }}>
                        <Save size={20} /> {isSaving ? 'SAVING...' : 'SAVE SCHEDULE'}
                    </Button>
                }
            />

            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                {/* Main Matrix Area */}
                <div style={{ flex: 1, overflowX: 'auto', paddingBottom: '20px' }}>
                    <TableContainer style={{ minWidth: '1400px' }}>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th style={{ minWidth: '100px', background: 'black', color: 'white' }}>SHIFT</Th>
                                    {DAYS.map(day => (
                                        <Th key={day} style={{ minWidth: '180px', background: 'black', color: 'white' }}>{day.substring(0, 3)}</Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {SHIFTS.map(shiftType => (
                                    <Tr key={shiftType}>
                                        {/* Shift Label */}
                                        <Td style={{ fontWeight: 'bold', background: '#f3f4f6', verticalAlign: 'middle', textAlign: 'center' }}>
                                            {shiftType}
                                        </Td>

                                        {/* Shift Cells (Droppable) */}
                                        {DAYS.map(day => {
                                            const dayShifts = getShiftsFor(day, shiftType);
                                            const status = validateShift(day, shiftType);

                                            return (
                                                <Td
                                                    key={`${day}-${shiftType}`}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, day, shiftType)}
                                                    style={{
                                                        verticalAlign: 'top',
                                                        minHeight: '150px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        marginBottom: '5px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold',
                                                        color: status.type === 'error' ? 'red' : 'green',
                                                        textAlign: 'right'
                                                    }}>
                                                        {status.msg}
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        {dayShifts.map((s, idx) => (
                                                            <div key={idx} style={{
                                                                background: '#eff6ff',
                                                                border: '1px solid #bfdbfe',
                                                                padding: '4px',
                                                                fontSize: '0.75rem',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                borderRadius: '4px',
                                                                boxShadow: '1px 1px 0 0 #bfdbfe'
                                                            }}>
                                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    <strong>{s.employeeName} ({s.position})</strong>
                                                                </div>
                                                                <div
                                                                    onClick={() => handleRemove(s)}
                                                                    style={{ cursor: 'pointer', color: 'red', marginLeft: '5px' }}
                                                                >
                                                                    <Trash2 size={10} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {dayShifts.length === 0 && (
                                                            <div style={{ paddingTop: '20px', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem' }}>
                                                                DROP HERE
                                                            </div>
                                                        )}
                                                    </div>
                                                </Td>
                                            );
                                        })}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            MORNING (07:00 - 15:00)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            AFTERNOON (15:00 - 23:00)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            EVENING (23:00 - 07:00)
                        </div>
                    </div>
                </div>

                {/* Sidebar Source (Draggable) */}
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                    <Card title="DRAG STAFF TO SCHEDULE" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {employees.map(emp => (
                                <Card
                                    key={emp.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, emp)}
                                    style={{
                                        padding: '10px',
                                        border: '2px solid black',
                                        boxShadow: '4px 4px 0 0 black',
                                        marginBottom: '0',
                                        cursor: 'grab',
                                        transition: 'transform 0.1s',
                                        background: 'white'
                                    }}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ fontWeight: '900' }}>{emp.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{emp.position}</div>
                                </Card>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
