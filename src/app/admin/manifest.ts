// src/app/admin/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luminares Admin',
    short_name: 'Admin',
    description: 'Panel de control y gestión para staff de Luminares',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#ffffff', 
theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-512.png', // O podés usar el logo de admin que prefieras
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}