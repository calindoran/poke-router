import { createFileRoute, Link } from "@tanstack/react-router";
import "../styles.css";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 bg-gradient-to-b sm:px-6 lg:px-8">
			<div className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-xl">
				<h1 className="py-6 text-2xl font-bold text-center">
					Welcome Trainer!
				</h1>
				<Link
					to="/login"
					className="inline-block w-full px-4 py-2 text-center text-white transition bg-blue-600 rounded hover:bg-blue-700"
				>
					Login
				</Link>
			</div>
		</div>
	);
}
