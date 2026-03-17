import { useState } from 'react';

import requestService from '../../services/requestService';

export default function SubmitRequest() {
	const [purpose, setPurpose] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setMessage('');

		try {
			const result = await requestService.createRequest({
				purpose,
				source: 'resident',
				status: 'pending',
			});
			setMessage(`Request submitted. ID: ${result?.data?.request_id || '-'}`);
			setPurpose('');
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to submit request');
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: '24px auto', padding: 16, border: '1px solid #d8e1ef', borderRadius: 12, background: '#fff' }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>Submit Request</h2>
			<textarea
				value={purpose}
				onChange={(e) => setPurpose(e.target.value)}
				placeholder="Purpose of request"
				rows={4}
				style={{ width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #c9d3e4', padding: 10, marginBottom: 10 }}
			/>
			{message ? <p style={{ color: '#0f7b6c' }}>{message}</p> : null}
			{error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
			<button type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#0e2554', color: '#fff', cursor: 'pointer' }}>
				Submit
			</button>
		</form>
	);
}
