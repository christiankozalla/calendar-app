export const generateUUID = () => {
    return 'xxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        const r = Math.random() * 16 | 0;
        return r.toString(16);
    });
}