import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash, Plus, Save, X, Image as ImageIcon, FileText } from 'lucide-react';

export default function PostManagementPage({ user }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        category: 'NEWS',
        status: 'DRAFT'
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
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            imageUrl: post.imageUrl,
            category: post.category,
            status: post.status
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("DELETE POST?")) return;
        try {
            await axios.delete(`/api/posts/${id}`);
            fetchPosts();
        } catch (e) {
            alert("FAILED TO DELETE");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // Update
                await axios.put(`/api/posts/${formData.id}`, formData);
            } else {
                // Create
                await axios.post('/api/posts', formData);
            }
            setModalOpen(false);
            fetchPosts();
        } catch (e) {
            alert("FAILED TO SAVE");
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
            imageUrl: '',
            category: 'NEWS',
            status: 'DRAFT'
        });
        setModalOpen(true);
    };

    return (
        <div style={{ padding: '40px' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', background: '#fca5a5', border: '4px solid black', padding: '20px', boxShadow: '8px 8px 0 0 black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1 }}>BLOG CMS</h1>
                    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', opacity: 0.6 }}>MANAGE NEWS AND ARTICLES</p>
                </div>
                <button onClick={openNewModal} style={{ background: 'black', color: 'white', border: 'none', padding: '15px 30px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Plus /> NEW POST
                </button>
            </div>

            {/* Posts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {posts.map(post => (
                    <div key={post.id} className="card" style={{ background: 'white', border: '4px solid black', padding: '20px', boxShadow: '8px 8px 0 0 black', display: 'flex', flexDirection: 'column' }}>
                        {post.imageUrl && (
                            <img src={post.imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover', border: '2px solid black', marginBottom: '15px' }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ background: post.status === 'PUBLISHED' ? '#86efac' : '#e5e7eb', padding: '5px 10px', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid black' }}>{post.status}</span>
                            <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.5 }}>{post.category}</span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 10px 0' }}>{post.title}</h2>
                        <p style={{ flex: 1, opacity: 0.7, fontSize: '0.9rem' }}>{post.excerpt}</p>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => handleEdit(post)} style={{ flex: 1, background: '#fef08a', border: '2px solid black', padding: '10px', fontWeight: 'bold', cursor: 'pointer' }}>EDIT</button>
                            <button onClick={() => handleDelete(post.id)} style={{ background: '#fca5a5', border: '2px solid black', padding: '10px', cursor: 'pointer' }}><Trash size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', border: '4px solid black', padding: '30px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase' }}>{formData.id ? 'EDIT POST' : 'NEW POST'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>TITLE</label>
                                <input name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid black', fontSize: '1.2rem', fontWeight: 'bold' }} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CATEGORY</label>
                                    <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid black', fontWeight: 'bold' }}>
                                        <option value="NEWS">NEWS</option>
                                        <option value="PROMO">PROMO</option>
                                        <option value="EVENT">EVENT</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>STATUS</label>
                                    <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid black', fontWeight: 'bold' }}>
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="PUBLISHED">PUBLISHED</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>IMAGE URL</label>
                                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '10px', border: '2px solid black' }} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>EXCERPT (Short Summary)</label>
                                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} style={{ width: '100%', padding: '10px', border: '2px solid black' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CONTENT (HTML/Markdown support planned)</label>
                                <textarea name="content" value={formData.content} onChange={handleChange} rows={10} style={{ width: '100%', padding: '10px', border: '2px solid black', fontFamily: 'monospace' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '15px', background: 'white', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer' }}>CANCEL</button>
                                <button type="submit" style={{ flex: 1, padding: '15px', background: 'black', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SAVE POST</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
