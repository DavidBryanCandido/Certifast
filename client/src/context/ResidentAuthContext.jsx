/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'certifast_resident_auth';

const ResidentAuthContext = createContext(null);

export function ResidentAuthProvider({ children }) {
	const [authState, setAuthState] = useState(() => {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { token: null, resident: null };
		try {
			return JSON.parse(raw);
		} catch {
			localStorage.removeItem(STORAGE_KEY);
			return { token: null, resident: null };
		}
	});

	const login = ({ token, resident }) => {
		const next = { token, resident };
		setAuthState(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	};

	const logout = () => {
		const next = { token: null, resident: null };
		setAuthState(next);
		localStorage.removeItem(STORAGE_KEY);
	};

	const value = useMemo(
		() => ({
			token: authState.token,
			resident: authState.resident,
			isAuthenticated: Boolean(authState.token),
			login,
			logout,
		}),
		[authState]
	);

	return <ResidentAuthContext.Provider value={value}>{children}</ResidentAuthContext.Provider>;
}

export function useResidentAuth() {
	const ctx = useContext(ResidentAuthContext);
	if (!ctx) {
		throw new Error('useResidentAuth must be used inside ResidentAuthProvider');
	}
	return ctx;
}
