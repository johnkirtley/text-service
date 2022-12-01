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

const generateCanvasImg = (imgSrc, productText, customerName) => {
    setTimeout(() => {
        document.querySelector('.qr-code-container').innerHTML = '';

        const canvas = document.createElement('canvas');
        const image = new Image();

        canvas.width = 250;
        canvas.height = 310;
        image.setAttribute('crossorigin', 'anonymous');
        image.src = imgSrc;

        const x = canvas.width / 2;

        let ctx;
        image.onload = function generate() {
            ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 30, 240, 240);
            ctx.textAlign = 'center';
            ctx.font = '25px arial';
            ctx.fillText(productText, x, 300);
            ctx.fillText(customerName, x, 20);
            ctx.canvas.style.imageRendering = 'high';
            ctx.imageSmoothingEnabled = 'true';
            ctx.scale(1, 2);
            document.querySelector('.qr-code-container').appendChild(canvas);
        };
    }, 1000);
};

export { items, handleTextChange, generateCanvasImg };
