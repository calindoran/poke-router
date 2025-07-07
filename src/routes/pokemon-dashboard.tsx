import { getAllPokemonQuery, getPaginatedPokemon, getPokemonQuery, type Pokemon } from "@/pokemon";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/pokemon-dashboard")({
	component: PokemonDashboard,
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(getAllPokemonQuery(20, 0)),
	errorComponent: ({ error }) => (
		<div className="flex items-center justify-center min-h-screen bg-red-100">
			Error! {error.message}
		</div>
	),
});

function PokemonDashboard() {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const offset = (currentPage - 1) * pageSize;

	const paginationHook = getPaginatedPokemon(pageSize, offset);
	const { data, isLoading, error } = useSuspenseQuery(paginationHook);

	const totalPages = data ? paginationHook.getTotalPages(data) : 0;
	const hasNext = data ? paginationHook.hasNextPage(data) : false;
	const hasPrevious = data ? paginationHook.hasPreviousPage(data) : false;
	const { queryClient } = Route.useRouteContext();

	const form = useForm({
		defaultValues: {
			search: "",
		},
		asyncDebounceMs: 500,
		onSubmit: async ({ value }) => {
			const searchValue = value.search;
			setSearchTerm(searchValue);

			// Only fetch if we have a search term and it doesn't match existing Pokémon
			if (!searchValue) return;

			const matchesExisting =
				data?.results?.some((pokemon: { name: string }) =>
					pokemon.name.toLowerCase().includes(searchValue.toLowerCase()),
				) ?? false;

			if (!matchesExisting) {
				try {
					await queryClient.fetchQuery(getPokemonQuery(searchValue));
				} catch (error) {
					console.error("Failed to fetch Pokemon:", error);
				}
			}
		},
	});

	const pokemonDetailsQuery = useSuspenseQuery<Pokemon, Error>(
		getPokemonQuery(searchTerm),
	);

	const filtered =
		data?.results?.filter((pokemon: { name: string }) =>
			pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	const filteredPokemon =
		searchTerm && filtered.length === 0 && pokemonDetailsQuery.data
			? [pokemonDetailsQuery.data]
			: filtered;

	return (
		<div className="flex flex-col items-center">
			<div className="w-full max-w-3xl overflow-hidden shadow-xl rounded-xl">
				<div className="flex items-center justify-center px-6 py-4 mt-6">
					<h1 className="text-3xl font-extrabold">Pokédex</h1>
				</div>

				<div className="p-6 ">
					<div className="p-4 mb-6 rounded-lg shadow-sm">
						<div className="relative">
							<form
								onSubmit={(e) => {
									e.preventDefault();
									form.handleSubmit();
								}}
							>
								<form.Field
									name="search"
									validators={{
										onChange: ({ value }) =>
											value.length < 3 && value.length > 0
												? "Search term must be at least 3 characters"
												: undefined,
										onChangeAsyncDebounceMs: 500,
										onChangeAsync: async ({ value }) => {
											if (!value) return undefined;
											await new Promise((resolve) => setTimeout(resolve, 1000));
											return (
												value.includes("error") &&
												"An error occurred while searching"
											);
										},
									}}
								>
									{(field) => (
										<div className="flex items-center space-x-2">
											<div className="transition-transform duration-200 transform hover:-translate-y-0.5">
												<button
													type="submit"
													className="p-2 capitalize transition-all duration-200 rounded-full shadow-md bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg"
												>
													<SearchIcon />
												</button>
											</div>
											<input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												placeholder="Search Pokémon..."
											/>
										</div>
									)}
								</form.Field>
							</form>
						</div>
					</div>

					<div className="p-4 mb-6 rounded-lg shadow-sm">
						<ul className="grid grid-cols-2 gap-3 p-2 overflow-y-auto sm:grid-cols-3 max-h-96">
							{isLoading ? (
								<li className="text-center text-gray-500 col-span-full">
									Loading Pokémon...
								</li>
							) : error ? (
								<li className="text-center text-red-500 col-span-full">
									Error: {error.message}
								</li>
							) : filteredPokemon.length > 0 ? (
								filteredPokemon.map((pokemon: { name: string; url?: string }) => {
									if (!pokemon.name) return null;
									return (
										<PokemonListItem key={pokemon.name} name={pokemon.name} />
									);
								},
								)
							) : (
								<li className="text-center text-gray-500 col-span-full">
									{searchTerm
										? "No Pokémon match your search"
										: "No Pokémon data available"}
								</li>
							)}

							{pokemonDetailsQuery.error && (
								<li className="text-center text-gray-500 col-span-full">
									{pokemonDetailsQuery.error.message}
								</li>
							)}
						</ul>
					</div>

					<div className="p-4 mb-6 rounded-lg shadow-sm">
						<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
							<div className="flex items-center space-x-4">
								<span className="text-sm text-gray-600">
									Page {currentPage} of {totalPages}
								</span>
								<div className="flex items-center space-x-2">
									<label htmlFor="pageSize" className="text-sm text-gray-600">
										Show:
									</label>
									<select
										id="pageSize"
										value={pageSize}
										onChange={(e) => {
											setPageSize(Number(e.target.value));
											setCurrentPage(1); // Reset to first page when changing page size
										}}
										className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value={10}>10 per page</option>
										<option value={20}>20 per page</option>
										<option value={50}>50 per page</option>
										<option value={100}>100 per page</option>
									</select>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<button
									onClick={() => setCurrentPage(1)}
									disabled={!hasPrevious}
									className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
								>
									First
								</button>
								<button
									onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
									disabled={!hasPrevious}
									className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
								>
									Previous
								</button>

								<div className="flex items-center space-x-1">
									<span className="text-sm text-gray-600">Go to:</span>
									<input
										type="number"
										min="1"
										max={totalPages}
										value={currentPage}
										onChange={(e) => {
											const page = Number(e.target.value);
											if (page >= 1 && page <= totalPages) {
												setCurrentPage(page);
											}
										}}
										className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<button
									onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
									disabled={!hasNext}
									className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
								>
									Next
								</button>
								<button
									onClick={() => setCurrentPage(totalPages)}
									disabled={!hasNext}
									className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
								>
									Last
								</button>
							</div>
						</div>

						{data && (
							<div className="mt-2 text-xs text-center text-gray-500">
								Showing {offset + 1} to {Math.min(offset + pageSize, data.count)} of {data.count} Pokémon
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const SearchIcon = ({ color }: { color?: string }) => (
	<svg
		className={`w-5 h-5 ${color ? color : "text-white"}`}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>
);

const PokemonListItem = ({ name }: { name: string }) => (
	<li className="transition-transform duration-200 transform hover:-translate-y-1">
		<Link
			to={`/pokemon-details/$name`}
			params={{ name }}
			className="block px-4 py-2 text-center text-white capitalize transition-all duration-200 rounded-full shadow-md bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg"
		>
			{name}
		</Link>
	</li>
);
