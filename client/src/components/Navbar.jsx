export default function Navbar({ title = 'CertiFast', subtitle = '', rightSlot = null }) {
	return (
		<header
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				padding: '12px 16px',
				borderBottom: '1px solid #e9eef4',
				background: '#ffffff',
			}}
		>
			<div>
				<h1 style={{ margin: 0, fontSize: 18, color: '#0e2554' }}>{title}</h1>
				{subtitle ? <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5f6b7a' }}>{subtitle}</p> : null}
			</div>
			{rightSlot}
		</header>
	);
}
