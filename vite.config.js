import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login/index.html'),
        register: resolve(__dirname, 'pages/register/index.html'),
        pricing: resolve(__dirname, 'pages/pricing/index.html'),
        'user-dashboard': resolve(__dirname, 'pages/user-dashboard/index.html'),
        'user-images': resolve(__dirname, 'pages/user-images/index.html'),
        'user-profile': resolve(__dirname, 'pages/user-profile/index.html'),
        'admin-dashboard': resolve(__dirname, 'pages/admin-dashboard/index.html'),
        'admin-users': resolve(__dirname, 'pages/admin-users/index.html'),
      },
    },
  },
});
