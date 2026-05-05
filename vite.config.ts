import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

/**
 * Rolldown (Vite 8) expects `manualChunks` to be a function, not the Rollup object map.
 */
function manualChunks(id: string): string | undefined {
    if (!id.includes('node_modules')) {
        return undefined;
    }

    if (
        id.includes('node_modules/react/') ||
        id.includes('node_modules/react-dom/')
    ) {
        return 'react-vendor';
    }
    if (id.includes('node_modules/@inertiajs/react/')) {
        return 'inertia-vendor';
    }
    if (id.includes('node_modules/@radix-ui/')) {
        return 'radix-vendor';
    }
    if (
        id.includes('node_modules/laravel-echo/') ||
        id.includes('node_modules/pusher-js/')
    ) {
        return 'realtime-vendor';
    }
    if (id.includes('node_modules/@tanstack/react-table/')) {
        return 'table-vendor';
    }
    if (id.includes('node_modules/lucide-react/')) {
        return 'icons-vendor';
    }

    return undefined;
}

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    build: {
        sourcemap: false,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks,
            },
        },
    },
});
