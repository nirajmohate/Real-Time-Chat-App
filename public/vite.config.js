// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "https://your-avatar-api.com",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   base: "./", // Ensures correct asset paths after deployment
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "https://your-avatar-api.com",
//         changeOrigin: true,
//         secure: true, // Set to true if your API uses HTTPS
//       },
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://your-backend-api.com", // Change this to your actual backend URL
        changeOrigin: true,
        secure: true, // Set to false if your API uses HTTP (not HTTPS)
      },
    },
  },
  build: {
    outDir: "dist", // Ensures correct build output
  },
});
