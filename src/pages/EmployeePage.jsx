import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Plus, Trash2, Search, Mail, Phone, User, Users, Edit, Lock, Unlock, History, Calendar, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

import PageHeader from '../components/ui/PageHeader';

export default function EmployeePage() {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [historyModal, setHistoryModal] = useState({ isOpen: false, logs: [], loading: false, employeeName: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        employeeId: '', name: '', email: '', phone: '',
        position: 'Barista', salary: 0, role: 'STAFF', password: 'password123'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/api/employees');
            setEmployees(res.data);
        } catch (e) {
            console.error("Fetch employees failed", e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/employees/${editingId}`, formData);
                setAlertMsg({ type: 'success', message: 'EMPLOYEE UPDATED!' });
            } else {
                await axios.post('/api/employees', formData);
                setAlertMsg({ type: 'success', message: 'NEW RECRUIT ADDED!' });
            }
            setIsModalOpen(false);
            fetchEmployees();
            resetForm();
        } catch (e) {
            setAlertMsg({ type: 'error', message: editingId ? 'UPDATE FAILED!' : 'FAILED TO RECRUIT!' });
        }
    };



    const generateNextId = () => {
        if (!employees.length) return 'EMP001';

        const ids = employees
            .map(e => e.employeeId)
            .filter(id => id.startsWith('EMP'))
            .map(id => parseInt(id.replace('EMP', ''), 10))
            .filter(n => !isNaN(n));

        if (!ids.length) return 'EMP001';

        const maxId = Math.max(...ids);
        return `EMP${String(maxId + 1).padStart(3, '0')}`;
    };

    const handleNewRecruit = () => {
        resetForm();
        setFormData(prev => ({ ...prev, employeeId: generateNextId() }));
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ employeeId: '', name: '', email: '', phone: '', position: 'Barista', salary: 0, role: 'STAFF', password: 'password123' });
        setEditingId(null);
    };

    const handleEdit = (emp) => {
        setFormData({
            employeeId: emp.employeeId,
            name: emp.name,
            email: emp.email || '',
            phone: emp.phone || '',
            position: emp.position || 'Barista',
            salary: emp.salary || 0,
            role: emp.role || 'STAFF',
            password: '' // Don't fill password on edit
        });
        setEditingId(emp.id);
        setIsModalOpen(true);
    };

    const handleFreeze = (emp) => {
        const action = emp.active ? 'FREEZE' : 'ACTIVATE';
        setConfirmDialog({
            isOpen: true,
            title: `${action} EMPLOYEE`,
            message: `ARE YOU SURE YOU WANT TO ${action} ${emp.name}? ${emp.active ? 'THEY WILL NOT BE ABLE TO LOGIN.' : 'THEY WILL BE ABLE TO LOGIN AGAIN.'}`,
            onConfirm: async () => {
                try {
                    await axios.patch(`/api/employees/${emp.id}/status`);
                    fetchEmployees();
                    setAlertMsg({ type: 'success', message: emp.active ? 'EMPLOYEE FROZEN (LOCKED)' : 'EMPLOYEE ACTIVATED' });
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO CHANGE STATUS' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    const handleDelete = async (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'TERMINATE EMPLOYEE',
            message: 'ARE YOU SURE YOU WANT TO REMOVE THIS EMPLOYEE FROM THE ROSTER? THIS ACTION CANNOT BE UNDONE.',
            onConfirm: async () => {
                setAlertMsg({ type: 'info', message: 'FEATURE NOT CONNECTED (MOCK)' });
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    const handleViewHistory = async (emp) => {
        setHistoryModal({ isOpen: true, logs: [], loading: true, employeeName: emp.name });
        try {
            const res = await axios.get(`/api/attendance/history/${emp.employeeId}`);
            setHistoryModal(prev => ({ ...prev, logs: res.data, loading: false }));
        } catch (e) {
            console.error(e);
            setAlertMsg({ type: 'error', message: 'FAILED TO LOAD HISTORY' });
            setHistoryModal(prev => ({ ...prev, loading: false, isOpen: false }));
        }
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="page-container">
            <PageHeader
                title="STAFF ROSTER"
                description="MANAGE YOUR TEAM MEMBERS"
                icon={Users}
                color="#dbeafe"
                action={
                    <Button onClick={handleNewRecruit} variant="primary" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
                        <Plus /> NEW RECRUIT
                    </Button>
                }
            />
            {/* Search */}
            <div style={{ marginBottom: '30px' }}>
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="SEARCH STAFF..."
                />
            </div>

            {/* Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {paginatedData.map(emp => (
                    <Card key={emp.id} style={{ background: 'white', padding: 0, overflow: 'hidden', opacity: emp.active ? 1 : 0.6 }}>
                        <div style={{ background: emp.position === 'Manager' ? 'black' : '#f3f4f6', color: emp.position === 'Manager' ? 'white' : 'black', padding: '20px', borderBottom: '4px solid black', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{emp.name}</h2>
                                    <div style={{ fontWeight: 'bold', opacity: 0.7 }}>{emp.position ? emp.position.toUpperCase() : 'UNKNOWN'}</div>
                                </div>
                                <User size={32} />
                            </div>
                            {!emp.active && (
                                <div style={{ position: 'absolute', top: '10px', right: '50px', background: 'red', color: 'white', padding: '2px 8px', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid white' }}>
                                    FROZEN
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px', opacity: 0.6 }}>EMPLOYEE ID</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>#{emp.employeeId}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={16} /> <span>{emp.email || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Phone size={16} /> <span>{emp.phone || '-'}</span>
                                </div>
                            </div>
                            <div style={{ padding: '10px', background: '#fef08a', border: '2px solid black', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                                Salary: Rp {(emp.salary || 0).toLocaleString('id-ID')}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <Button onClick={() => handleEdit(emp)} variant="secondary" style={{ width: '100%' }}>
                                    <Edit size={16} /> EDIT
                                </Button>
                                <Button
                                    onClick={() => handleFreeze(emp)}
                                    disabled={emp.role && emp.role.toUpperCase() === 'MANAGER'}
                                    style={{
                                        width: '100%',
                                        background: (emp.role && emp.role.toUpperCase() === 'MANAGER') ? '#e5e7eb' : (emp.active ? '#9ca3af' : '#22c55e'),
                                        color: (emp.role && emp.role.toUpperCase() === 'MANAGER') ? '#9ca3af' : 'white',
                                        cursor: (emp.role && emp.role.toUpperCase() === 'MANAGER') ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {emp.active ? <><Lock size={16} /> FREEZE</> : <><Unlock size={16} /> ACTIVATE</>}
                                </Button>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <Button onClick={() => handleViewHistory(emp)} variant="secondary" style={{ width: '100%', border: '2px dashed black' }}>
                                    <History size={16} /> ATTENDANCE HISTORY
                                </Button>
                            </div>
                            <Button onClick={() => handleDelete(emp.id)} variant="danger" style={{ width: '100%' }}>
                                <Trash2 size={18} /> TERMINATE
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filtered.length}
                />
            )}

            {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>NO STAFF FOUND</div>}

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "EDIT EMPLOYEE" : "RECRUIT NEW STAFF"}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Input label="EMPLOYEE ID" value={formData.employeeId} readOnly={true} placeholder="Auto-generated" />
                        <Input label="FULL NAME" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required maxLength={50} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Select label="POSITION" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value, role: e.target.value === 'Manager' ? 'MANAGER' : 'STAFF' })}
                            options={['Barista', 'Manager', 'Cashier', 'Baker', 'Cleaner'].map(p => ({ value: p, label: p }))} />
                        <Input label="SALARY (IDR)" type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} required />
                    </div>

                    <Input label="EMAIL" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} maxLength={100} />
                    <Input label="PHONE" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} maxLength={20} />

                    {editingId && (
                        <div style={{ marginBottom: '20px', padding: '10px', background: '#ffe4e6', border: '1px solid red' }}>
                            <small style={{ fontWeight: 'bold', color: 'red' }}>LEAVE PASSWORD BLANK TO KEEP CURRENT PASSWORD</small>
                            <Input label="NEW PASSWORD" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Enter new password to change..." maxLength={100} />
                        </div>
                    )}

                    {!editingId && (
                        <Input label="PASSWORD" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required maxLength={100} />
                    )}

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1 }}>{editingId ? "SAVE CHANGES" : "CONFIRM RECRUIT"}</Button>
                    </div>
                </form>
            </Modal>

            {/* History Modal */}
            <Modal isOpen={historyModal.isOpen} onClose={() => setHistoryModal({ ...historyModal, isOpen: false })} title={`ATTENDANCE: ${historyModal.employeeName}`} maxWidth="1000px">
                {historyModal.loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>LOADING RECORDS...</div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {historyModal.logs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>NO HISTORY FOUND</div>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>DATE</Th>
                                            <Th>IN</Th>
                                            <Th>OUT</Th>
                                            <Th>STATUS</Th>
                                            <Th>HOURS</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {historyModal.logs.map((log) => (
                                            <Tr key={log.id}>
                                                <Td>{log.date}</Td>
                                                <Td>{log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</Td>
                                                <Td>{log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</Td>
                                                <Td>
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: (log.status === 'LATE' || log.checkInStatus === 'LATE') ? 'red' : 'green'
                                                    }}>
                                                        {log.status || log.checkInStatus || '-'}
                                                    </span>
                                                </Td>
                                                <Td>{log.hoursWorked ? log.hoursWorked.toFixed(1) : '-'}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}
                    </div>
                )}
            </Modal>


            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}
        </div>
    );
}
