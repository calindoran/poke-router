import { pokemonQuery, type Pokemon } from "@/pokemon";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pokemon-details/$name")({
	component: PokemonDetails,
	loader: async ({ params, context }) =>
		context.queryClient.ensureQueryData(pokemonQuery(params.name)),
	errorComponent: ({ error }) => (
		<div className="flex items-center justify-center min-h-screen bg-red-100">
			Error! {error.message}
		</div>
	),
});

function PokemonDetails() {
	const { name } = Route.useParams();
	const { data } = useSuspenseQuery<Pokemon, Error>(pokemonQuery(name));
	const { auth } = Route.useRouteContext();

	if (!data) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-500">Loading Pokémon details...</p>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center ">
			<div className="flex flex-col items-center w-full max-w-sm p-8 bg-white shadow-lg rounded-xl">
				<h1 className="mb-4 text-3xl font-bold capitalize">{data.name}</h1>
				{auth.user?.role === "admin" && (
					<button
						type="button"
						className="mb-4"
						onClick={() => {
							if (window.confirm(
								`Are you sure you want to edit this Pokémon? ${data.name} (ID: ${data.id}?)`
							)) {
								return;
							}
						}}
					>
						Edit Pokémon
					</button>
				)}
				<div className="flex items-center justify-center w-40 h-40 mb-4">
					<img
						src={data.sprites?.front_default ?? ""}
						alt={data.name}
						className="object-contain w-full h-full"
					/>
				</div>
				<div className="mb-4 text-center">
					<p className="text-gray-700">
						Height: <span className="font-semibold">{data.height}</span>
					</p>
					<p className="text-gray-700">
						Weight: <span className="font-semibold">{data.weight}</span>
					</p>
					<p className="text-gray-700">
						Types:
						<span className="font-semibold">
							{data.types?.map((type) => type.type.name).join(", ") || "N/A"}
						</span>
					</p>
				</div>
				<div className="w-full">
					<h2 className="mt-4 mb-2 text-lg font-semibold">Abilities</h2>
					<ul className="mb-4">
						{data.abilities?.map((ability) => (
							<li key={ability.ability.name} className="my-1 capitalize">
								{ability.ability.name}
							</li>
						)) || <li>No abilities found</li>}
					</ul>
					<h2 className="mt-4 mb-2 text-lg font-semibold">Stats</h2>
					<ul>
						{data.stats?.map((stat) => (
							<li key={stat.stat.name} className="my-1 capitalize">
								{stat.stat.name}:
								<span className="font-semibold">{stat.base_stat}</span>
							</li>
						)) || <li>No stats found</li>}
					</ul>
				</div>
			</div>
		</div>
	);
}
