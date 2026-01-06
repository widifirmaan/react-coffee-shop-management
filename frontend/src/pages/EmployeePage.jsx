import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeePage() {
    const [employees, setEmployees] = useState([]);
    const [newEmp, setNewEmp] = useState({ name: '', role: 'Barista', salary: 0 });

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

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/employees', newEmp);
            setNewEmp({ name: '', role: 'Barista', salary: 0 });
            fetchEmployees();
        } catch (e) {
            alert("Error adding employee");
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
                <h1>STAFF MANAGEMENT</h1>
                <div className="grid">
                    {employees.map(emp => (
                        <div key={emp.id} className="card">
                            <h3>{emp.name}</h3>
                            <div className="badge" style={{ marginBottom: '10px' }}>{emp.role}</div>
                            <p>Salary: Rp {emp.salary.toLocaleString()}</p>
                            <p>Attendance: {emp.attendanceRecord ? emp.attendanceRecord.length : 0} days</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
                <h3>REGISTER EMPLOYEE</h3>
                <form onSubmit={handleAdd}>
                    <label>Full Name</label>
                    <input value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} required />

                    <label>Role</label>
                    <select value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}>
                        <option value="Barista">Barista</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Manager">Manager</option>
                        <option value="Chef">Chef</option>
                    </select>

                    <label>Salary (Rp)</label>
                    <input type="number" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: parseFloat(e.target.value) })} required />

                    <button className="primary" style={{ width: '100%' }}>REGISTER</button>
                </form>
            </div>
        </div>
    );
}
