import { useEffect, useState } from 'react';

import logsService from '../../services/logsService';
import formatDate from '../../utils/formatDate';

export default function LogsAuditTrail() {
	const [rows, setRows] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const token = localStorage.getItem('certifast_admin_token') || '';
				const result = await logsService.getLogs(token);
				if (mounted) setRows(result.data || []);
			} catch (err) {
				if (mounted) setError(err?.response?.data?.message || 'Failed to load logs');
			}
		}

		load();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>Logs & Audit Trail</h2>
			{error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
			<div style={{ overflowX: 'auto', border: '1px solid #d8e1ef', borderRadius: 10 }}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead style={{ background: '#f5f8fc' }}>
						<tr>
							<th style={th}>Action</th>
							<th style={th}>Actor</th>
							<th style={th}>Description</th>
							<th style={th}>Date</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.log_id}>
								<td style={td}>{row.action}</td>
								<td style={td}>{row.actor_type}</td>
								<td style={td}>{row.description || '-'}</td>
								<td style={td}>{formatDate(row.created_at)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

const th = { textAlign: 'left', padding: 10, borderBottom: '1px solid #d8e1ef', color: '#1e375b' };
const td = { padding: 10, borderBottom: '1px solid #edf2f8', color: '#42546a' };
