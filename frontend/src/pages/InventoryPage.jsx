import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Search, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';

import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

export default function InventoryPage() {
    const [ingredients, setIngredients] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: '', minThreshold: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [editingId, setEditingId] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const res = await axios.get('/api/ingredients');
            setIngredients(res.data);
        } catch (e) {
            console.error("Fetch ingredients failed", e);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/ingredients/${editingId}`, newItem);
                setAlertMsg({ type: 'success', message: 'INVENTORY ITEM UPDATED!' });
            } else {
                await axios.post('/api/ingredients', newItem);
                setAlertMsg({ type: 'success', message: 'NEW ITEM ADDED!' });
            }
            resetForm();
            setIsModalOpen(false);
            fetchIngredients();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO SAVE ITEM!' });
        }
    };

    const resetForm = () => {
        setNewItem({ name: '', quantity: 0, unit: '', minThreshold: 0 });
        setEditingId(null);
    };

    const handleEdit = (item) => {
        setNewItem({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            minThreshold: item.minThreshold
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'DELETE ITEM',
            message: 'ARE YOU SURE YOU WANT TO DELETE THIS ITEM? THIS CANNOT BE UNDONE.',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/ingredients/${id}`);
                    setAlertMsg({ type: 'success', message: 'ITEM DELETED!' });
                    fetchIngredients();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE ITEM' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    const filtered = ingredients.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                title="INVENTORY"
                description="CONTROL YOUR STOCK LEVELS"
                icon={Package}
                color="#e0f2fe"
                action={
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }} variant="primary" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
                        <Plus /> ADD ITEM
                    </Button>
                }
            />

            {/* Search */}
            <div style={{ marginBottom: '30px' }}>
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="SEARCH INVENTORY..."
                />
            </div>



            {/* Table */}
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            {['NAME', 'QUANTITY', 'UNIT', 'MIN LEVEL', 'STATUS', 'ACTION'].map(h =>
                                <Th key={h}>{h}</Th>
                            )}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedData.map((ing, idx) => (
                            <Tr key={ing.id} index={idx}>
                                <Td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{ing.name}</Td>
                                <Td style={{ fontWeight: 'bold' }}>{ing.quantity}</Td>
                                <Td>{ing.unit}</Td>
                                <Td>{ing.minThreshold}</Td>
                                <Td>
                                    {ing.quantity < ing.minThreshold ?
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: 'bold' }}>
                                            <AlertTriangle size={16} /> LOW STOCK
                                        </div> :
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 'bold' }}>
                                            <CheckCircle size={16} /> OK
                                        </div>}
                                </Td>
                                <Td style={{ display: 'flex', gap: '10px' }}>
                                    <Button onClick={() => handleEdit(ing)} variant="secondary" style={{ padding: '8px' }}>
                                        <Edit size={16} />
                                    </Button>
                                    <Button onClick={() => handleDelete(ing.id)} variant="danger" style={{ padding: '8px' }}>
                                        <Trash2 size={16} />
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                        {filtered.length === 0 && (
                            <Tr>
                                <Td colSpan="6" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>NO ITEMS FOUND</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filtered.length}
                />
            )}

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "UPDATE STOCK" : "ADD NEW STOCK"}>
                <form onSubmit={handleAdd}>
                    <Input label="ITEM NAME" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Input label="QUANTITY" type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} required />
                        <Input label="UNIT (kg, pcs)" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} required />
                    </div>
                    <Input label="MIN THRESHOLD" type="number" value={newItem.minThreshold} onChange={e => setNewItem({ ...newItem, minThreshold: e.target.value })} required />

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1 }}>{editingId ? "SAVE CHANGES" : "ADD ITEM"}</Button>
                    </div>
                </form>
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
