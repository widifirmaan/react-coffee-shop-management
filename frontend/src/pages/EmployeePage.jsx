import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Search, X, UserPlus, Phone, Mail, DollarSign } from 'lucide-react';

export default function EmployeePage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        position: 'Barista',
        salary: 0,
        role: 'STAFF', // Default role for auth
        password: 'password123' // Default pwd
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/api/employees');
            setEmployees(res.data);
            // Generate next ID logic if needed, or just let user input
        } catch (e) {
            console.error("Fetch employees failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        setShowForm(false);
        fetchEmployees();
        setFormData({
            employeeId: '', name: '', email: '', phone: '',
            position: 'Barista', salary: 0, role: 'STAFF', password: 'password123'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/employees', formData);
            alert("STAFF ADDED SUCCESSFULLY!");
            handleSuccess();
        } catch (e) {
            alert("FAILED TO ADD STAFF!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("FIRE THIS EMPLOYEE?")) return;
        // API delete logic if available, else just UI mock
        // await axios.delete(`/api/employees/${id}`); 
        alert("FEATURE NOT CONNECTED TO API (Mock)");
    };

    // Filter logic
    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'monospace' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>STAFF ROSTER</h1>
                    <p style={{ opacity: 0.6 }}>MANAGE YOUR TEAM MEMBERS</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: showForm ? 'white' : 'black',
                        color: showForm ? 'black' : 'white',
                        border: '4px solid black',
                        padding: '15px 30px',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: showForm ? 'none' : '6px 6px 0 0 rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.2s'
                    }}
                >
                    {showForm ? <X /> : <Plus />} {showForm ? 'CLOSE FORM' : 'ADD NEW STAFF'}
                </button>
            </div>

            {/* Add Form Panel */}
            {showForm && (
                <div style={{
                    border: '4px solid black', padding: '30px', marginBottom: '30px',
                    background: '#e0f2fe', boxShadow: '10px 10px 0 0 black'
                }}>
                    <h2 style={{ marginTop: 0, display: 'flex', gap: '10px' }}><UserPlus /> NEW RECRUIT FORM</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>EMPLOYEE ID</label>
                            <input required value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                placeholder="EMP-XXX"
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>FULL NAME</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="JOHN DOE"
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>POSITION</label>
                            <select value={formData.position} onChange={e => {
                                const pos = e.target.value;
                                const role = pos === 'Manager' ? 'MANAGER' : 'STAFF';
                                setFormData({ ...formData, position: pos, role: role });
                            }}
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold', background: 'white' }}>
                                <option value="Barista">Barista</option>
                                <option value="Manager">Manager</option>
                                <option value="Cashier">Cashier</option>
                                <option value="Baker">Baker</option>
                                <option value="Cleaner">Cleaner</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>SALARY (IDR)</label>
                            <input type="number" required value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                placeholder="5000000"
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>EMAIL</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@company.com"
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>PHONE</label>
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="0812..."
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <button type="submit" style={{ width: '100%', padding: '15px', background: 'black', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', border: 'none', cursor: 'pointer' }}>
                                CONFIRM RECRUITMENT
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Bar */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', border: '4px solid black', background: 'white' }}>
                <div style={{ padding: '15px', borderRight: '4px solid black', background: '#facc15' }}>
                    <Search style={{ display: 'block' }} />
                </div>
                <input
                    placeholder="SEARCH STAFF BY NAME..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, border: 'none', padding: '15px', fontSize: '1.2rem', outline: 'none', fontWeight: 'bold', fontFamily: 'monospace' }}
                />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '4px solid black', boxShadow: '10px 10px 0 0 black' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'black', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '20px', borderRight: '2px solid white' }}>ID</th>
                            <th style={{ padding: '20px', borderRight: '2px solid white' }}>NAME</th>
                            <th style={{ padding: '20px', borderRight: '2px solid white' }}>POSITION</th>
                            <th style={{ padding: '20px', borderRight: '2px solid white' }}>CONTACT</th>
                            <th style={{ padding: '20px', borderRight: '2px solid white' }}>SALARY</th>
                            <th style={{ padding: '20px', width: '100px' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody style={{ background: 'white' }}>
                        {filtered.map((emp, idx) => (
                            <tr key={emp.id || idx} style={{ borderBottom: '2px solid black', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                                <td style={{ padding: '15px', borderRight: '2px solid black', fontWeight: 'bold' }}>#{emp.employeeId}</td>
                                <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{emp.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>Joined: 2024</div>
                                </td>
                                <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                                    <span style={{
                                        background: emp.position === 'Manager' ? 'black' : 'white',
                                        color: emp.position === 'Manager' ? 'white' : 'black',
                                        border: '2px solid black', padding: '5px 10px',
                                        fontWeight: 'bold', fontSize: '0.9rem'
                                    }}>
                                        {emp.position.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                                        <Mail size={14} /> {emp.email || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Phone size={14} /> {emp.phone || 'N/A'}
                                    </div>
                                </td>
                                <td style={{ padding: '15px', borderRight: '2px solid black', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    Rp {(emp.salary || 0).toLocaleString('id-ID')}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleDelete(emp.id)}
                                        style={{
                                            background: '#ef4444', color: 'white', border: '2px solid black',
                                            padding: '8px', cursor: 'pointer', boxShadow: '2px 2px 0 0 black'
                                        }}
                                        title="Terminated"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', background: 'white' }}>
                        NO STAFF FOUND.
                    </div>
                )}
            </div>
        </div>
    );
}
