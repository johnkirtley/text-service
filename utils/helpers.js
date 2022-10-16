function getItem(label, key, icon, children) {
    return { key, icon, children, label };
}

const items = [
    getItem('Home', '1'),
    getItem('Products and QR Codes', '2'),
    getItem('Settings', '3'),
];

const handleTextChange = (e, cb) => {
    cb(e.target.value);
};

export { items, handleTextChange };
