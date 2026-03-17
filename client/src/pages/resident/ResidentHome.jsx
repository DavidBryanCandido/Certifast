export default function ResidentHome({ resident, onLogout }) {
	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>Resident Home</h2>
			<p style={{ color: '#42546a' }}>Welcome, {resident?.name || resident?.full_name || 'Resident'}.</p>
			<button type="button" onClick={onLogout} style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#0e2554', color: '#fff', cursor: 'pointer' }}>
				Logout
			</button>
		</div>
	);
}
