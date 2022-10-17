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

const generateCanvasImg = (imgSrc, text) => {
    document.querySelector('.qr-code-container').innerHTML = '';

    const canvas = document.createElement('canvas');
    const image = new Image();

    canvas.width = 150;
    canvas.height = 165;
    image.src = imgSrc;

    const x = canvas.width / 2;

    let ctx;
    image.onload = function () {
        ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 140, 140);
        ctx.textAlign = 'center';
        ctx.font = '12px arial';
        ctx.fillText(text, x, 160);
        document.querySelector('.qr-code-container').appendChild(canvas);
    };
};

export { items, handleTextChange, generateCanvasImg };
