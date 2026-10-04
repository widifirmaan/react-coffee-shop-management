/**
 * Parses and normalizes shiftStaff data from orders into a consistent array of staff objects:
 * [{ name: string, role: string }]
 *
 * Handles:
 * - Arrays of objects [{ name: '...', role: '...' }]
 * - Arrays of strings ['Budi', 'Rina']
 * - Dictionary objects { Barista: 'Budi', Cashier: 'Rina' }
 * - Plain strings 'Andi Manager' or 'Cashier' (PREVENTS single-letter character splitting)
 * - JSON stringified arrays or objects
 * - Null / undefined
 */
export function parseShiftStaff(shiftStaff) {
    if (!shiftStaff) return [];

    // If it's a JSON string that wasn't parsed
    if (typeof shiftStaff === 'string') {
        const trimmed = shiftStaff.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                const parsed = JSON.parse(trimmed);
                return parseShiftStaff(parsed);
            } catch {
                // Not JSON, continue as plain string
            }
        }
        // Plain string (e.g. "Andi Manager" or "Cashier") -> DO NOT treat as object or split letters!
        return [{ name: trimmed, role: '' }];
    }

    // If it's an Array
    if (Array.isArray(shiftStaff)) {
        return shiftStaff.map(item => {
            if (typeof item === 'string') {
                return { name: item, role: '' };
            }
            if (item && typeof item === 'object') {
                return {
                    name: item.name || item.employeeName || item.employeeId || 'Staff',
                    role: item.role || item.position || ''
                };
            }
            return { name: String(item), role: '' };
        }).filter(s => s.name && s.name !== 'undefined');
    }

    // If it's an Object (dictionary mapping role to name)
    if (typeof shiftStaff === 'object') {
        return Object.entries(shiftStaff)
            .filter(([role, name]) => name && isNaN(Number(role))) // Ignore numeric keys like "0", "1"
            .map(([role, name]) => {
                if (typeof name === 'object' && name !== null) {
                    return {
                        name: name.name || name.employeeName || 'Staff',
                        role: name.role || role
                    };
                }
                return {
                    name: String(name),
                    role: role.replace(/([A-Z])/g, ' $1').trim()
                };
            });
    }

    return [];
}
