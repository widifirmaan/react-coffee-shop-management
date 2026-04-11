import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';

import PageHeader from '../components/ui/PageHeader';

export default function PostManagementPage({ user }) {
    const fileInputRef = useRef(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [alertMsg, setAlertMsg] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        category: 'NEWS',
        status: 'DRAFT',
        createdAt: new Date().toISOString().slice(0, 16) // Format for datetime-local
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get('/api/posts');
            setPosts(res.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handleEdit = (post) => {
        setFormData({
            id: post.id,
            title: post.title || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            featuredImage: post.featuredImage || '',
            category: post.category || 'NEWS',
            status: post.status || 'DRAFT',
            createdAt: post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'DELETE POST',
            message: 'ARE YOU SURE YOU WANT TO DELETE THIS POST? THIS ACTION CANNOT BE UNDONE.',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/posts/${id}`);
                    fetchPosts();
                    setAlertMsg({ type: 'success', message: 'POST DELETED!' });
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE!' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fileData = new FormData();
        fileData.append('file', file);

        try {
            const res = await axios.post('/api/uploads', fileData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // The API returns the Base64 Data URI directly
            setFormData(prev => ({ ...prev, featuredImage: res.data }));
            setAlertMsg({ type: 'success', message: 'IMAGE UPLOADED!' });
        } catch (e) {
            console.error(e);
            setAlertMsg({ type: 'error', message: 'UPLOAD FAILED!' });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = () => {
        setFormData(prev => ({ ...prev, featuredImage: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (formData.id) {
                // Update
                await axios.put(`/api/posts/${formData.id}`, formData);
            } else {
                // Create
                await axios.post('/api/posts', formData);
            }
            setModalOpen(false);
            
            // Clear search and reset to page 1 so the new/edited post is visible
            setSearchTerm('');
            setCurrentPage(1);
            
            fetchPosts();
            setAlertMsg({ type: 'success', message: 'POST SAVED!' });
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO SAVE!' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openNewModal = () => {
        setFormData({
            id: null,
            title: '',
            excerpt: '',
            content: '',
            featuredImage: '',
            category: 'NEWS',
            status: 'DRAFT',
            createdAt: new Date().toISOString().slice(0, 16) // Today's date
        });
        setModalOpen(true);
    };

    const filteredPosts = posts.filter(p =>
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                title="BLOG CMS"
                description="MANAGE NEWS AND ARTICLES"
                color="#fca5a5"
                action={
                    <Button onClick={openNewModal} variant="primary">
                        <Plus /> NEW POST
                    </Button>
                }
            />

            {/* Search */}
            <div style={{ marginTop: '20px', marginBottom: '30px' }}>
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="SEARCH POSTS BY TITLE OR CATEGORY..."
                />
            </div>

            {/* Posts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {paginatedPosts.map(post => (
                    <Card key={post.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        {post.featuredImage && (
                            <img src={post.featuredImage} style={{ width: '100%', height: '200px', objectFit: 'cover', border: '2px solid black', marginBottom: '15px' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ background: post.status === 'PUBLISHED' ? '#86efac' : '#e5e7eb', padding: '5px 10px', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid black' }}>{post.status}</span>
                            <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.5 }}>{post.category}</span>
                        </div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            margin: '0 0 10px 0',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.4em'
                        }}>{post.title}</h2>
                        <p style={{ flex: 1, opacity: 0.7, fontSize: '0.9rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{post.excerpt}</p>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <Button onClick={() => handleEdit(post)} variant="accent" style={{ flex: 1 }}>EDIT</Button>
                            <Button onClick={() => handleDelete(post.id)} variant="danger"><Trash size={18} /></Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredPosts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredPosts.length}
                />
            )}

            {filteredPosts.length === 0 && !loading && (
                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.5, fontWeight: 'bold' }}>
                    NO POSTS FOUND.
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={formData.id ? 'EDIT POST' : 'NEW POST'}>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="TITLE"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength={100}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Select
                            label="CATEGORY"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            options={[
                                { value: 'NEWS', label: 'NEWS' },
                                { value: 'PROMO', label: 'PROMO' },
                                { value: 'EVENT', label: 'EVENT' }
                            ]}
                        />
                        <Select
                            label="STATUS"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={[
                                { value: 'DRAFT', label: 'DRAFT' },
                                { value: 'PUBLISHED', label: 'PUBLISHED' }
                            ]}
                        />
                    </div>

                    <Input
                        label="POST DATE"
                        name="createdAt"
                        type="datetime-local"
                        value={formData.createdAt}
                        onChange={handleChange}
                        required
                    />

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize: '0.8rem' }}>POST IMAGE</label>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="IMAGE URL"
                                    name="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    maxLength={2000} // Increased for Base64
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" disabled={uploading} style={{ fontSize: '0.8rem', padding: '10px' }}>
                                        <Upload size={16} style={{ marginRight: '8px' }} /> {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                                    </Button>
                                    {formData.featuredImage && (
                                        <Button type="button" onClick={handleDeleteImage} variant="danger" style={{ fontSize: '0.8rem', padding: '10px' }}>
                                            <Trash size={16} />
                                        </Button>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    hidden 
                                    accept="image/*" 
                                />
                            </div>
                            {formData.featuredImage ? (
                                <div style={{ width: '120px', height: '120px', border: '3px solid black', shadow: '4px 4px 0 0 black', overflow: 'hidden', background: '#f3f4f6' }}>
                                    <img src={formData.featuredImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div style={{ width: '120px', height: '120px', border: '3px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                    <ImageIcon size={40} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        label="EXCERPT (Short Summary)"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        type="textarea"
                        style={{ input: { rows: 3 } }}
                        maxLength={200}
                    />

                    <Input
                        label="CONTENT"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        type="textarea"
                        style={{ input: { rows: 10, fontFamily: 'monospace' } }}
                        maxLength={10000}
                    />

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Button onClick={() => setModalOpen(false)} variant="secondary" style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={saving}>
                            {saving ? 'SAVING...' : 'SAVE POST'}
                        </Button>
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
