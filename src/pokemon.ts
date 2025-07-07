// Using the PokeAPI to fetch Pokémon data

export interface PokemonResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: Array<{
		name: string;
		url: string;
	}>;
}

export interface Pokemon {
	id: number;
	name: string;
	order: number;
	base_experience: number;
	height: number;
	weight: number;
	species: {
		name: string;
		url: string;
	};
	sprites: {
		front_default: string;
		other: {
			"official-artwork": {
				front_default: string;
			};
		};
	};
	types: Array<{
		slot: number;
		type: {
			name: string;
			url: string;
		};
	}>;
	abilities: Array<{
		is_hidden: boolean;
		slot: number;
		ability: {
			name: string;
			url: string;
		};
	}>;
	stats: Array<{
		base_stat: number;
		effort: number;
		stat: {
			name: string;
			url: string;
		};
	}>;
	moves: Array<{
		move: {
			name: string;
			url: string;
		};
		version_group_details: Array<{
			level_learned_at: number;
			version_group: {
				name: string;
				url: string;
			};
			move_learn_method: {
				name: string;
				url: string;
			};
		}>;
	}>;
}

async function getAllPokemon() {
	const data = await fetch("https://pokeapi.co/api/v2/pokemon/");
	return (await data.json()) as PokemonResponse;
}

export const allPokemonQuery = () => ({
	queryKey: ["pokemon"],
	queryFn: () => getAllPokemon(),
});

async function getPokemon(name: string) {
	const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
	return (await data.json()) as Pokemon;
}

export const pokemonQuery = (name: string) => ({
	queryKey: ["pokemon"],
	queryFn: () => getPokemon(name),
});
