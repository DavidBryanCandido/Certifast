import { useEffect, useState } from 'react';

import requestService from '../../services/requestService';
import formatDate from '../../utils/formatDate';

export default function MyRequests() {
	const [rows, setRows] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const result = await requestService.getAllRequests();
				if (mounted) setRows(result.data || []);
			} catch (err) {
				if (mounted) setError(err?.response?.data?.message || 'Failed to load requests');
			}
		}

		load();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>My Requests</h2>
			{error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
			<ul style={{ paddingLeft: 18, color: '#42546a' }}>
				{rows.map((row) => (
					<li key={row.request_id} style={{ marginBottom: 8 }}>
						#{row.request_id} - {row.purpose || '-'} - {row.status || '-'} ({formatDate(row.requested_at)})
					</li>
				))}
			</ul>
		</div>
	);
}
