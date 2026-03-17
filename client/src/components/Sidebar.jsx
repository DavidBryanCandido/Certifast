export default function Sidebar({ items = [], activeKey = '', onNavigate = () => {} }) {
	return (
		<aside
			style={{
				width: 240,
				minHeight: '100vh',
				background: 'linear-gradient(180deg, #0e2554 0%, #0a1d45 100%)',
				color: '#e6edf7',
				padding: 12,
				boxSizing: 'border-box',
			}}
		>
			{items.map((item) => {
				const active = item.key === activeKey;
				return (
					<button
						key={item.key}
						type="button"
						onClick={() => onNavigate(item.key)}
						style={{
							display: 'block',
							width: '100%',
							textAlign: 'left',
							marginBottom: 8,
							border: 'none',
							borderRadius: 8,
							padding: '10px 12px',
							cursor: 'pointer',
							background: active ? '#c9a227' : 'transparent',
							color: active ? '#0e2554' : '#e6edf7',
							fontWeight: 600,
						}}
					>
						{item.label}
					</button>
				);
			})}
		</aside>
	);
}
