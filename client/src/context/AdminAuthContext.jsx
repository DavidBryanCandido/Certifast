/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'certifast_admin_auth';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
	const [authState, setAuthState] = useState(() => {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { token: null, admin: null };
		try {
			return JSON.parse(raw);
		} catch {
			localStorage.removeItem(STORAGE_KEY);
			return { token: null, admin: null };
		}
	});

	const login = ({ token, admin }) => {
		const next = { token, admin };
		setAuthState(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	};

	const logout = () => {
		const next = { token: null, admin: null };
		setAuthState(next);
		localStorage.removeItem(STORAGE_KEY);
	};

	const value = useMemo(
		() => ({
			token: authState.token,
			admin: authState.admin,
			isAuthenticated: Boolean(authState.token),
			login,
			logout,
		}),
		[authState]
	);

	return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
	const ctx = useContext(AdminAuthContext);
	if (!ctx) {
		throw new Error('useAdminAuth must be used inside AdminAuthProvider');
	}
	return ctx;
}
