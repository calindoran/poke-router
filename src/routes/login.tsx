import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { useAuth } from "../auth";
import { sleep } from "../utils";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const fallback = "/pokemon-dashboard" as const;

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<em>{field.state.meta.errors.join(", ")}</em>
			) : null}
			{field.state.meta.isValidating ? "Validating..." : null}
		</>
	);
}

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		redirect: z.string().optional().catch(""),
	}),
	beforeLoad: ({ context, search }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: search.redirect || fallback });
		}
	},
	component: LoginComponent,
});

function LoginComponent() {
	const auth = useAuth();
	const router = useRouter();
	const isLoading = useRouterState({ select: (s) => s.isLoading });
	const navigate = Route.useNavigate();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const search = Route.useSearch();
	const isLoggingIn = isLoading || isSubmitting;

	const form = useForm({
		defaultValues: {
			username: "",
			role: "",
		},
		onSubmit: async (values) => {
			setIsSubmitting(true);
			try {
				if (!values.value.username) return;
				await auth.login({
					username: values.value.username,
					role: values.value.role.toLowerCase() as "user" | "admin",
				});
				await router.invalidate();
				await sleep(1);
				await navigate({ to: search.redirect || fallback });
			} catch (error) {
				console.error("Error logging in: ", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 bg-gradient-to-b sm:px-6 lg:px-8">
			<div className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-xl">
				<div className="p-6 ">
					<h3 className="text-xl">Login</h3>
					<form
						className="max-w-lg mt-4"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="grid gap-2 items-center min-w-[300px]">
							<label htmlFor="username-input" className="text-sm font-medium">
								Username
							</label>
							<form.Field
								name="username"
								validators={{
									onChange: ({ value }) =>
										!value
											? "A name is required"
											: value.length < 3
												? "Name must be at least 3 characters"
												: undefined,
									onChangeAsyncDebounceMs: 2000,
									onChangeAsync: async ({ value }) => {
										await new Promise((resolve) => setTimeout(resolve, 1000));
										return (
											value.includes("error") &&
											'No "error" allowed in first name'
										);
									},
								}}
							>
								{(field) => (
									<>
										<input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Enter your username"
										/>
										<FieldInfo field={field} />
									</>
								)}
							</form.Field>
							<label htmlFor="role-select" className="text-sm font-medium">
								Role
							</label>
							<form.Field
								name="role"
								validators={{
									onChange: ({ value }) =>
										!value ? "Role is required" : undefined,
								}}
							>
								{(field) => (
									<>
										<select
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select a role</option>
											<option value="user">User</option>
											<option value="admin">Admin</option>
										</select>
										<FieldInfo field={field} />
									</>
								)}
							</form.Field>
						</div>

						<button
							type="submit"
							className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md disabled:bg-gray-300 disabled:text-gray-500"
						>
							{isLoggingIn ? "Loading..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
