// Using the PokeAPI to fetch Pokémon data

export interface PokemonResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: {
		name: string;
		url: string;
	}[];
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
	types: {
		slot: number;
		type: {
			name: string;
			url: string;
		};
	}[];
	abilities: {
		is_hidden: boolean;
		slot: number;
		ability: {
			name: string;
			url: string;
		};
	}[];
	stats: {
		base_stat: number;
		effort: number;
		stat: {
			name: string;
			url: string;
		};
	}[];
	moves: {
		move: {
			name: string;
			url: string;
		};
		version_group_details: {
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
		}[];
	}[];
	cries?: {
		latest?: string;
		legacy?: string;
	};
	forms?: {
		name: string;
		url: string;
	}[];
	game_indices?: {
		game_index: number;
		version: {
			name: string;
			url: string;
		};
	}[];
	held_items?: any[];
	past_abilities?: {
		abilities: {
			ability: any;
			is_hidden: boolean;
			slot: number;
		}[];
		generation: {
			name: string;
			url: string;
		};
	}[];
	past_types?: any[];
}

async function getAllPokemon(limit: number, offset: number) {
	const data = await fetch(
		`https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`,
	);
	return (await data.json()) as PokemonResponse;
}

export const getAllPokemonQuery = (limit: number, offset: number) => ({
	queryKey: ["allpokemon", limit, offset],
	queryFn: () => getAllPokemon(limit, offset),
});

async function getPokemon(name: string) {
	const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
	return (await data.json()) as Pokemon;
}

export const getPokemonQuery = (name: string) => ({
	queryKey: ["pokemon"],
	queryFn: () => getPokemon(name),
});

export interface PokeDashContext {
	searchTerm: string;
	limit: number;
	offset: number;
}

// Pagination helper functions
export const getPaginationFromUrl = (
	url: string | null,
): { limit: number; offset: number } | null => {
	if (!url) return null;

	const urlObj = new URL(url);
	const limit = Number(urlObj.searchParams.get("limit")) || 20;
	const offset = Number(urlObj.searchParams.get("offset")) || 0;

	return { limit, offset };
};

export const calculateTotalPages = (count: number, limit: number): number => {
	return Math.ceil(count / limit);
};

export const calculateCurrentPage = (offset: number, limit: number): number => {
	return Math.floor(offset / limit) + 1;
};

// Paginated Pokemon hook with utilities
export const getPaginatedPokemon = (limit: number, offset: number) => ({
	queryKey: ["paginatedpokemon", limit, offset],
	queryFn: () => getAllPokemon(limit, offset),
	// Helper methods for pagination
	getNextPageParams: (data: PokemonResponse) => getPaginationFromUrl(data.next),
	getPreviousPageParams: (data: PokemonResponse) =>
		getPaginationFromUrl(data.previous),
	getCurrentPage: () => calculateCurrentPage(offset, limit),
	getTotalPages: (data: PokemonResponse) =>
		calculateTotalPages(data.count, limit),
	hasNextPage: (data: PokemonResponse) => data.next !== null,
	hasPreviousPage: (data: PokemonResponse) => data.previous !== null,
});
