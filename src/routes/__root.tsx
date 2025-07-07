import { useAuth, type AuthContext } from "@/auth";
import type { QueryClient } from "@tanstack/react-query";
import {
	Link,
	Outlet,
	createRootRouteWithContext,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	auth: AuthContext;
}>()({
	beforeLoad: ({ context }) => {
		if (!context.queryClient) {
			throw new Error(
				"QueryClient is not available in the context. Make sure to provide it in the router configuration.",
			);
		}
	},
	component: () => {
		const router = useRouter();
		const navigate = Route.useNavigate();
		const auth = useAuth();

		const handleLogout = () => {
			if (window.confirm("Are you sure you want to logout?")) {
				auth.logout().then(() => {
					router.invalidate().finally(() => {
						navigate({ to: "/" });
					});
				});
			}
		};

		return (
			<div className="flex flex-col min-h-screen">
				{auth.isAuthenticated && (
					<div className="sticky top-0 flex justify-between p-2 px-4 mb-4 shadow-md">
						<Link to="/pokemon-dashboard" className="[&.active]:font-bold">
							Home
						</Link>
						<button
							type="button"
							className="hover:underline"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				)}
				<Outlet />
				<TanStackRouterDevtools />
			</div>
		);
	},
});
