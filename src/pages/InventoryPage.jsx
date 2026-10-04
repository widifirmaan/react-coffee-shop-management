import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package, Plus, Trash2, Search, AlertTriangle, CheckCircle,
    Edit, BookOpen, Link as LinkIcon, RefreshCw, Layers
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

export default function InventoryPage({ user }) {
    const isManager = user?.role?.toUpperCase() === 'MANAGER';
    const [activeTab, setActiveTab] = useState('STOCK'); // 'STOCK' or 'RECIPES'
    const [ingredients, setIngredients] = useState([]);
    const [menus, setMenus] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [alertMsg, setAlertMsg] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // Stock Form
    const [newItem, setNewItem] = useState({ name: '', category: 'Coffee', quantity: 0, unit: 'g', minThreshold: 0, price: 0, supplier: '' });

    // Recipe Form
    const [newRecipe, setNewRecipe] = useState({ menuId: '', menuName: '', ingredientId: '', ingredientName: '', amount: 0, unit: '' });

    useEffect(() => {
        fetchIngredients();
        fetchMenus();
        fetchRecipes();
    }, []);

    const fetchIngredients = async () => {
        try {
            const res = await axios.get('/api/ingredients');
            setIngredients(res.data);
        } catch (e) {
            console.error("Fetch ingredients failed", e);
        }
    };

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            setMenus(res.data);
        } catch (e) {
            console.error("Fetch menus failed", e);
        }
    };

    const fetchRecipes = async () => {
        try {
            const res = await axios.get('/api/recipes');
            setRecipes(res.data);
        } catch (e) {
            console.error("Fetch recipes failed", e);
        }
    };

    // STOCK HANDLERS
    const handleSaveStock = async (e) => {
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
            const msg = e.response?.data?.message || 'FAILED TO SAVE ITEM!';
            setAlertMsg({ type: 'error', message: msg });
        }
    };

    const resetForm = () => {
        setNewItem({ name: '', category: 'Coffee', quantity: 0, unit: 'g', minThreshold: 0, price: 0, supplier: '' });
        setEditingId(null);
    };

    const handleEditStock = (item) => {
        setNewItem({
            name: item.name,
            category: item.category || 'Coffee',
            quantity: item.quantity,
            unit: item.unit,
            minThreshold: item.minThreshold || item.minStock || 0,
            price: item.price || 0,
            supplier: item.supplier || ''
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleDeleteStock = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'DELETE INGREDIENT?',
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

    // RECIPE HANDLERS
    const handleSaveRecipe = async (e) => {
        e.preventDefault();
        if (!newRecipe.menuId || !newRecipe.ingredientId || !newRecipe.amount) {
            setAlertMsg({ type: 'error', message: 'PLEASE FILL ALL REQUIRED FIELDS' });
            return;
        }

        const selectedMenu = menus.find(m => m.id === newRecipe.menuId);
        const selectedIng = ingredients.find(i => i.id === newRecipe.ingredientId);

        try {
            await axios.post('/api/recipes', {
                menuId: newRecipe.menuId,
                menuName: selectedMenu ? selectedMenu.name : newRecipe.menuName,
                ingredientId: newRecipe.ingredientId,
                ingredientName: selectedIng ? selectedIng.name : newRecipe.ingredientName,
                amount: parseFloat(newRecipe.amount),
                unit: newRecipe.unit || (selectedIng ? selectedIng.unit : 'pcs')
            });
            setAlertMsg({ type: 'success', message: 'RECIPE DEDUCTION LINKED SUCCESSFULLY!' });
            setIsRecipeModalOpen(false);
            setNewRecipe({ menuId: '', menuName: '', ingredientId: '', ingredientName: '', amount: 0, unit: '' });
            fetchRecipes();
        } catch (e) {
            const msg = e.response?.data?.message || 'FAILED TO SAVE RECIPE!';
            setAlertMsg({ type: 'error', message: msg });
        }
    };

    const handleDeleteRecipe = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'REMOVE RECIPE LINK?',
            message: 'ARE YOU SURE? THIS MENU WILL NO LONGER AUTO-DEDUCT THIS INGREDIENT.',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/recipes/${id}`);
                    setAlertMsg({ type: 'success', message: 'RECIPE LINK REMOVED!' });
                    fetchRecipes();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE RECIPE' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    // Filter calculations
    const searchLower = (searchTerm || '').toLowerCase();
    const filteredStock = ingredients.filter(i =>
        (i.name || '').toLowerCase().includes(searchLower) ||
        (i.category && i.category.toLowerCase().includes(searchLower))
    );

    const filteredRecipes = recipes.filter(r =>
        (r.menuName && r.menuName.toLowerCase().includes(searchLower)) ||
        (r.ingredientName && r.ingredientName.toLowerCase().includes(searchLower))
    );

    const lowStockCount = ingredients.filter(i => {
        const threshold = parseFloat(i.minThreshold ?? i.minStock ?? 0);
        const currentQty = parseFloat(i.quantity ?? i.stock ?? 0);
        return currentQty <= threshold;
    }).length;

    // Pagination
    const currentList = activeTab === 'STOCK' ? filteredStock : filteredRecipes;
    const totalPages = Math.ceil(currentList.length / itemsPerPage);
    const paginatedData = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="page-container" style={{ paddingTop: '40px' }}>
            <Alert
                type={alertMsg?.type}
                message={alertMsg?.message}
                onClose={() => setAlertMsg(null)}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant="danger"
                confirmText="DELETE"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

            {/* Header */}
            <PageHeader
                title="INVENTORY & RECIPES"
                description="RAW MATERIALS STOCK & AUTOMATIC RECIPE (BOM) DEDUCTION"
                icon={Package}
                color="#e0f2fe"
                action={
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {activeTab === 'STOCK' ? (
                            <Button
                                onClick={() => { resetForm(); setIsModalOpen(true); }}
                                variant="primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#38bdf8', color: 'black' }}
                            >
                                <Plus size={18} /> ADD STOCK ITEM
                            </Button>
                        ) : isManager ? (
                            <Button
                                onClick={() => setIsRecipeModalOpen(true)}
                                variant="primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f59e0b', color: 'black' }}
                            >
                                <LinkIcon size={18} /> LINK NEW RECIPE
                            </Button>
                        ) : null}
                    </div>
                }
            />

            {/* KPI STAT CARDS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <Card style={{ background: '#60a5fa', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '900', opacity: 0.8 }}>TOTAL INGREDIENTS</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace' }}>{ingredients.length}</div>
                        </div>
                        <Package size={36} />
                    </div>
                </Card>

                <Card style={{ background: lowStockCount > 0 ? '#fca5a5' : '#86efac', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '900', opacity: 0.8 }}>
                                {lowStockCount > 0 ? 'LOW STOCK WARNINGS' : 'ALL STOCKS HEALTHY'}
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace' }}>
                                {lowStockCount}
                            </div>
                        </div>
                        {lowStockCount > 0 ? <AlertTriangle size={36} /> : <CheckCircle size={36} />}
                    </div>
                </Card>

                <Card style={{ background: '#fcd34d', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '900', opacity: 0.8 }}>ACTIVE RECIPE LINKS</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace' }}>{recipes.length}</div>
                        </div>
                        <BookOpen size={36} />
                    </div>
                </Card>
            </div>

            {/* TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => { setActiveTab('STOCK'); setCurrentPage(1); }}
                    style={{
                        padding: '12px 24px',
                        border: '3px solid black',
                        background: activeTab === 'STOCK' ? 'black' : 'white',
                        color: activeTab === 'STOCK' ? 'white' : 'black',
                        fontWeight: '900',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'STOCK' ? '4px 4px 0 0 #38bdf8' : '2px 2px 0 0 black'
                    }}
                >
                    📦 INVENTORY STOCK LEVELS
                </button>

                <button
                    onClick={() => { setActiveTab('RECIPES'); setCurrentPage(1); }}
                    style={{
                        padding: '12px 24px',
                        border: '3px solid black',
                        background: activeTab === 'RECIPES' ? 'black' : 'white',
                        color: activeTab === 'RECIPES' ? 'white' : 'black',
                        fontWeight: '900',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'RECIPES' ? '4px 4px 0 0 #f59e0b' : '2px 2px 0 0 black'
                    }}
                >
                    📜 MENU RECIPES & BOM AUTO-DEDUCTION
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '25px' }}>
                <SearchBar
                    value={searchTerm}
                    onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                    placeholder={activeTab === 'STOCK' ? "SEARCH INGREDIENTS OR CATEGORIES..." : "SEARCH RECIPES BY MENU OR INGREDIENT..."}
                />
            </div>

            {/* TAB 1: STOCK TABLE */}
            {activeTab === 'STOCK' && (
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>INGREDIENT NAME</Th>
                                <Th>CATEGORY</Th>
                                <Th>CURRENT STOCK</Th>
                                <Th>MIN THRESHOLD</Th>
                                <Th>SUPPLIER</Th>
                                <Th>STATUS</Th>
                                <Th style={{ textAlign: 'center' }}>ACTIONS</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {paginatedData.map((ing, idx) => {
                                const isLow = (ing.quantity || 0) <= (ing.minThreshold || ing.minStock || 0);
                                return (
                                    <Tr key={ing.id} index={idx}>
                                        <Td style={{ fontWeight: '900', fontSize: '1.05rem' }}>{ing.name}</Td>
                                        <Td>
                                            <span style={{ background: '#f3f4f6', border: '1px solid black', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {ing.category || 'General'}
                                            </span>
                                        </Td>
                                        <Td style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '1.1rem' }}>
                                            {ing.quantity} {ing.unit}
                                        </Td>
                                        <Td style={{ fontFamily: 'monospace' }}>
                                            {ing.minThreshold || ing.minStock || 0} {ing.unit}
                                        </Td>
                                        <Td style={{ fontSize: '0.85rem' }}>{ing.supplier || '-'}</Td>
                                        <Td>
                                            {isLow ? (
                                                <Badge variant="danger">
                                                    <AlertTriangle size={14} /> LOW STOCK
                                                </Badge>
                                            ) : (
                                                <Badge variant="success">
                                                    <CheckCircle size={14} /> OK
                                                </Badge>
                                            )}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <Button onClick={() => handleEditStock(ing)} variant="secondary" style={{ padding: '6px 10px' }}>
                                                    <Edit size={16} />
                                                </Button>
                                                {isManager && (
                                                    <Button onClick={() => handleDeleteStock(ing.id)} variant="danger" style={{ padding: '6px 10px' }}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                );
                            })}
                            {filteredStock.length === 0 && (
                                <Tr>
                                    <Td colSpan={7} style={{ padding: '40px', textAlign: 'center', opacity: 0.5, fontWeight: 'bold' }}>
                                        NO INGREDIENTS FOUND
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}

            {/* TAB 2: RECIPES / BOM TABLE */}
            {activeTab === 'RECIPES' && (
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>MENU ITEM</Th>
                                <Th>DEDUCTED INGREDIENT</Th>
                                <Th>PORTION PER CUP / SERVING</Th>
                                <Th>AUTO-DEDUCTION TRIGGER</Th>
                                {isManager && <Th style={{ textAlign: 'center' }}>ACTION</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {paginatedData.map((rec, idx) => (
                                <Tr key={rec.id} index={idx}>
                                    <Td style={{ fontWeight: '900', fontSize: '1.05rem', color: '#1e3a8a' }}>
                                        {rec.menuName || 'Menu Item'}
                                    </Td>
                                    <Td style={{ fontWeight: 'bold' }}>
                                        {rec.ingredientName || 'Ingredient'}
                                    </Td>
                                    <Td style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '1rem', color: '#b91c1c' }}>
                                        - {rec.amount} {rec.unit || ''}
                                    </Td>
                                    <Td>
                                        <span style={{ background: '#dcfce7', border: '1.5px solid black', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 'bold', color: '#15803d' }}>
                                            ON ORDER (PREPARING/COMPLETED)
                                        </span>
                                    </Td>
                                    {isManager && (
                                        <Td style={{ textAlign: 'center' }}>
                                            <Button onClick={() => handleDeleteRecipe(rec.id)} variant="danger" style={{ padding: '6px 10px' }}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </Td>
                                    )}
                                </Tr>
                            ))}
                            {filteredRecipes.length === 0 && (
                                <Tr>
                                    <Td colSpan={5} style={{ padding: '40px', textAlign: 'center', opacity: 0.5, fontWeight: 'bold' }}>
                                        NO RECIPE LINKS CONFIGURED YET. CLICK "LINK NEW RECIPE" TO ADD AUTOMATIC DEDUCTIONS.
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={currentList.length}
                />
            )}

            {/* ADD / EDIT STOCK MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "UPDATE INVENTORY STOCK" : "ADD NEW INVENTORY ITEM"}>
                <form onSubmit={handleSaveStock}>
                    <Input label="ITEM NAME" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required maxLength={50} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>CATEGORY</label>
                            <select
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }}
                            >
                                <option value="Coffee">Coffee (Biji Kopi)</option>
                                <option value="Dairy">Dairy (Susu Segar)</option>
                                <option value="Dairy Alternative">Dairy Alternative (Oat, Soy)</option>
                                <option value="Sweetener">Sweetener (Gula, Sirup)</option>
                                <option value="Powder">Powder (Matcha, Chocolate)</option>
                                <option value="Packaging">Packaging (Cup, Straw, Bag)</option>
                                <option value="Food">Food (Bahan Makanan)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>UNIT (g, ml, pcs, kg)</label>
                            <input
                                type="text"
                                required
                                value={newItem.unit}
                                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <Input label="QUANTITY IN STOCK" type="number" step="any" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} required />
                        <Input label="MIN THRESHOLD ALERT" type="number" step="any" value={newItem.minThreshold} onChange={e => setNewItem({ ...newItem, minThreshold: e.target.value })} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <Input label="COST PRICE (IDR)" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                        <Input label="SUPPLIER NAME" value={newItem.supplier} onChange={e => setNewItem({ ...newItem, supplier: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1, background: '#38bdf8', color: 'black' }}>
                            {editingId ? "SAVE CHANGES" : "ADD TO STOCK"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* LINK RECIPE MODAL (Manager) */}
            <Modal isOpen={isRecipeModalOpen} onClose={() => setIsRecipeModalOpen(false)} title="LINK RECIPE: AUTOMATIC INGREDIENT DEDUCTION">
                <form onSubmit={handleSaveRecipe}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '6px' }}>SELECT MENU ITEM *</label>
                        <select
                            required
                            value={newRecipe.menuId}
                            onChange={(e) => {
                                const m = menus.find(item => item.id === e.target.value);
                                setNewRecipe({ ...newRecipe, menuId: e.target.value, menuName: m ? m.name : '' });
                            }}
                            style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }}
                        >
                            <option value="">-- Choose Menu Item --</option>
                            {menus.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '6px' }}>SELECT RAW INGREDIENT TO DEDUCT *</label>
                        <select
                            required
                            value={newRecipe.ingredientId}
                            onChange={(e) => {
                                const ing = ingredients.find(item => item.id === e.target.value);
                                setNewRecipe({
                                    ...newRecipe,
                                    ingredientId: e.target.value,
                                    ingredientName: ing ? ing.name : '',
                                    unit: ing ? ing.unit : 'pcs'
                                });
                            }}
                            style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }}
                        >
                            <option value="">-- Choose Ingredient --</option>
                            {ingredients.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name} (Available: {ing.quantity} {ing.unit})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '6px' }}>AMOUNT DEDUCTED PER SERVING *</label>
                            <input
                                type="number"
                                step="any"
                                min="0.01"
                                required
                                placeholder="e.g. 18 for espresso beans, 150 for milk"
                                value={newRecipe.amount}
                                onChange={e => setNewRecipe({ ...newRecipe, amount: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '6px' }}>UNIT</label>
                            <input
                                type="text"
                                readOnly
                                value={newRecipe.unit}
                                style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold', background: '#f3f4f6' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: '#fef3c7', border: '2px solid black', padding: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
                        💡 <strong>How it works:</strong> Whenever this menu is ordered, the system will automatically deduct this amount from real-time stock when processed by the Cashier or Kitchen.
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsRecipeModalOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1, background: '#f59e0b', color: 'black' }}>
                            LINK RECIPE
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
