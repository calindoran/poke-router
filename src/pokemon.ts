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
	is_default: boolean;
	location_area_encounters: string;
	species: {
		name: string;
		url: string;
	};
	sprites: {
		front_default?: string;
		front_female?: string;
		front_shiny?: string;
		front_shiny_female?: string;
		back_default?: string;
		back_female?: string;
		back_shiny?: string;
		back_shiny_female?: string;
		other: {
			"official-artwork": {
				front_default: string;
				front_shiny?: string;
			};
			dream_world?: {
				front_default?: string;
				front_female?: string;
			};
			home?: {
				front_default?: string;
				front_female?: string;
				front_shiny?: string;
				front_shiny_female?: string;
			};
			showdown?: {
				front_default?: string;
				front_female?: string;
				front_shiny?: string;
				front_shiny_female?: string;
				back_default?: string;
				back_female?: string;
				back_shiny?: string;
				back_shiny_female?: string;
			};
		};
		versions?: any; // Complex nested structure, using any for simplicity
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
			move_learn_method: {
				name: string;
				url: string;
			};
			order?: number | null;
			version_group: {
				name: string;
				url: string;
			};
		}>;
	}>;
	cries?: {
		latest?: string;
		legacy?: string;
	};
	forms?: Array<{
		name: string;
		url: string;
	}>;
	game_indices?: Array<{
		game_index: number;
		version: {
			name: string;
			url: string;
		};
	}>;
	held_items?: any[];
	past_abilities?: Array<{
		abilities: Array<{
			ability: any;
			is_hidden: boolean;
			slot: number;
		}>;
		generation: {
			name: string;
			url: string;
		};
	}>;
	past_types?: any[];
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
