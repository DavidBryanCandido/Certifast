const QRCode = require('qrcode');

async function generateQR(data) {
	return QRCode.toDataURL(String(data || ''), {
		errorCorrectionLevel: 'M',
		margin: 1,
		width: 320,
	});
}

module.exports = generateQR;
