import { StickyNote, Save } from 'lucide-react';

export const TeamNotesWidget = ({
    noteContent,
    setNoteContent,
    originalNoteContent,
    setOriginalNoteContent,
    isEditing,
    setIsEditing,
    isManager,
    onSave,
    isHover,
    setIsHover
}) => {
    return (
        <div
            className="card"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{
                background: '#fef08a', color: 'black', border: '4px solid black', position: 'relative',
                transform: isHover ? 'translate(-4px, -4px)' : 'none',
                boxShadow: isHover ? '12px 12px 0 0 black' : '8px 8px 0 0 black',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40px', background: 'rgba(0,0,0,0.05)', borderBottom: '2px solid black' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', opacity: 0.8 }}>
                    <StickyNote size={20} /> TEAM NOTES
                </h3>
                {isEditing && isManager && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => {
                                setNoteContent(originalNoteContent);
                                setIsEditing(false);
                            }}
                            style={{ background: 'white', color: 'black', border: '2px solid black', padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            CANCEL
                        </button>
                        <button onClick={onSave} style={{ background: 'black', color: 'white', border: '2px solid black', padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                            <Save size={14} /> SAVE
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <textarea
                    autoFocus
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    style={{
                        width: '100%',
                        height: '200px',
                        background: 'white',
                        border: '2px solid black',
                        padding: '10px',
                        resize: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        fontFamily: 'monospace',
                        lineHeight: '1.5',
                        color: 'black',
                        position: 'relative',
                        zIndex: 1,
                        caretColor: 'black'
                    }}
                    placeholder="Type something..."
                />
            ) : (
                <div
                    onClick={() => isManager && setIsEditing(true)}
                    title={isManager ? "Click to edit" : ""}
                    style={{
                        width: '100%',
                        height: '200px',
                        overflowY: 'auto',
                        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                        fontSize: '1.2rem',
                        lineHeight: '1.5',
                        color: '#333',
                        cursor: isManager ? 'pointer' : 'default',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {noteContent || (
                        <span style={{ opacity: 0.5, fontStyle: 'italic' }}>
                            {isManager ? "Tap here to write a note..." : "No notes from manager."}
                        </span>
                    )}
                </div>
            )}

            <div style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'right', marginTop: '5px' }}>
                {isEditing ? 'Editing mode' : (isManager ? 'Tap text to edit' : 'Read-only')}
            </div>
        </div>
    );
};
