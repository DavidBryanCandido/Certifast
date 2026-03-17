import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function MyQRCode({ resident }) {
	const [qrDataUrl, setQrDataUrl] = useState('');

	useEffect(() => {
		let mounted = true;
		const payload = JSON.stringify({
			resident_id: resident?.id || resident?.resident_id || null,
			name: resident?.name || resident?.full_name || 'Resident',
			type: 'resident_profile',
		});

		QRCode.toDataURL(payload, { width: 220, margin: 1 })
			.then((url) => {
				if (mounted) setQrDataUrl(url);
			})
			.catch(() => {
				if (mounted) setQrDataUrl('');
			});

		return () => {
			mounted = false;
		};
	}, [resident]);

	return (
		<div style={{ padding: 24, textAlign: 'center' }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>My QR Code</h2>
			{qrDataUrl ? <img src={qrDataUrl} alt="Resident QR code" style={{ width: 220, height: 220 }} /> : <p>Generating QR...</p>}
		</div>
	);
}
