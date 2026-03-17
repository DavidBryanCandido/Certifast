import { useState } from 'react';

export default function QRScanner({ onScan = () => {} }) {
	const [value, setValue] = useState('');

	return (
		<div style={{ border: '1px solid #d7deea', borderRadius: 10, padding: 12, background: '#fff' }}>
			<p style={{ marginTop: 0, color: '#0e2554', fontWeight: 600 }}>QR Scanner (manual test mode)</p>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Paste scanned QR payload"
				style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c9d3e4' }}
			/>
			<button
				type="button"
				onClick={() => onScan(value)}
				style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#0e2554', color: '#fff', cursor: 'pointer' }}
			>
				Submit Scan
			</button>
		</div>
	);
}
