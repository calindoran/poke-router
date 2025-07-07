import * as React from "react";
import { sleep } from "./utils";

export interface User {
	username: string;
	role: "user" | "admin";
}

export interface AuthContext {
	isAuthenticated: boolean;
	login: (user: User) => Promise<void>;
	logout: () => Promise<void>;
	user: User | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const key = "poke.auth.user";

function setStoredUser(user: User | null) {
	if (user) {
		localStorage.setItem(key, JSON.stringify(user));
	} else {
		localStorage.removeItem(key);
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(() => {
		const stored = localStorage.getItem(key);
		return stored ? (JSON.parse(stored) as User) : null;
	});
	const isAuthenticated = !!user;

	const logout = React.useCallback(async () => {
		await sleep(250);

		setStoredUser(null);
		setUser(null);
	}, []);

	const login = React.useCallback(async (user: User) => {
		await sleep(500);

		setStoredUser(user);
		setUser(user);
	}, []);

	React.useEffect(() => {
		const stored = localStorage.getItem(key);
		setUser(stored ? (JSON.parse(stored) as User) : null);
	}, []);

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
