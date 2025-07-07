import { getPokemonQuery, type Pokemon } from '@/pokemon';
import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/pokemon-edit/$name')({
    component: PokemonEdit,
    loader: async ({ params, context }) =>
        context.queryClient.ensureQueryData(getPokemonQuery(params.name)),
    errorComponent: ({ error }) => (
        <div className="flex items-center justify-center min-h-screen bg-red-100">
            Error! {error.message}
        </div>
    ),
})

const pokemonSchema = z.object({
    selectedSprite: z.string(),
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    height: z.number().min(1, 'Height must be greater than 0'),
    weight: z.number().min(1, 'Weight must be greater than 0'),
});


function PokemonEdit() {
    const { name } = Route.useParams();
    const { data } = useSuspenseQuery<Pokemon, Error>(getPokemonQuery(name));
    const { auth } = Route.useRouteContext();
    const navigate = Route.useNavigate();


    const form = useForm({
        defaultValues: {
            selectedSprite: data?.sprites?.front_default || '',
            name: data?.name || '',
            height: data?.height || 0,
            weight: data?.weight || 0,
        },
        validators: {
            onChange: pokemonSchema,
        },
        onSubmit: async ({ value }) => {
            // Handle form submission here (e.g., API call to update Pokemon)
            console.log('Submitted values:', value);

            // Redirect to details page
            navigate({
                to: "/pokemon-details/$name",
                params: { name: value.name },
            });
        },
    });

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading Pokémon details...</p>
            </div>
        );
    }

    if (auth.user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Access denied. Admin role required.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-sm p-8 bg-white shadow-lg rounded-xl">
                <h1 className="mb-4 text-3xl font-bold">Edit Pokémon</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="w-full space-y-4"
                >
                    <form.Field
                        name="selectedSprite"
                        children={(field) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Sprite
                                </label>
                                <select
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Object.entries(data.sprites || {})
                                        .filter(([_, url]) => url !== null)
                                        .sort(([a], [b]) => a === 'front_default' ? -1 : b === 'front_default' ? 1 : 0)
                                        .map(([key]) => (
                                            <option key={key} value={key}>
                                                {key.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </option>
                                        ))}
                                </select>
                                <div className="flex justify-center mt-2">
                                    <img
                                        src={(data?.sprites as any)?.[field.state.value] || data?.sprites?.front_default}
                                        alt={data.name}
                                        className="object-contain w-32 h-32"
                                    />
                                </div>
                            </div>
                        )}
                    />

                    <form.Field
                        name="name"
                        children={(field) => (
                            <div>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {field.state.meta.errors && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {field.state.meta.errors.map(error => typeof error === 'string' ? error : error?.message || 'Invalid value').join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <form.Field
                        name="height"
                        children={(field) => (
                            <div>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                    Height
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {field.state.meta.errors && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {field.state.meta.errors.map(error => typeof error === 'string' ? error : error?.message || 'Invalid value').join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <form.Field
                        name="weight"
                        children={(field) => (
                            <div>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                    Weight
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {field.state.meta.errors && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {field.state.meta.errors.map(error => typeof error === 'string' ? error : error?.message || 'Invalid value').join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate({
                                to: "/pokemon-details/$name",
                                params: { name: data.name },
                            })}
                            className="flex-1 px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
