import { Search } from 'lucide-react';
import { Input } from './Input';

export default function SearchBar({ value, onChange, placeholder = "SEARCH..." }) {
    return (
        <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    container: { margin: 0 },
                    input: { fontWeight: 'bold' }
                }}
            />
        </div>
    );
}
