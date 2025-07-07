import { createFileRoute, Link } from "@tanstack/react-router";
import "../styles.css";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-sm p-8 bg-white rounded shadow-md">
				<h1 className="mb-6 text-2xl font-bold text-center">Welcome!</h1>
				<Link
					to="/login"
					className="inline-block w-full px-4 py-2 text-center text-white transition bg-blue-600 rounded hover:bg-blue-700"
				>
					Go to Login
				</Link>
			</div>
		</div>
	);
}
