// vite.config.js
export default {
    server: {
      proxy: {
        // Proxy all requests starting with /hmgis to the remote API
        '/hmgis': {
          target: 'https://data.hurricanemapping.com',
          changeOrigin: true,
          secure: true,
        }
      }
    }
  }