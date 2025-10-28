// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "letterbox-backend",
      script: "index.js",              // El archivo principal está en la raíz
      watch: false,                    // Desactiva el reinicio automático en cambios
      instances: 1,                    // Número de instancias a ejecutar
      exec_mode: "fork",              // Modo de ejecución
      autorestart: true,              // Reinicio automático si la app se cae
      max_memory_restart: "1G",       // Reiniciar si se excede este límite de memoria
      env: {                          // Variables de entorno por defecto
        NODE_ENV: "development",
        PORT: 3003,
        QUIET: true,                  // Suprime los logs de dotenv
        FRONTEND_URL: "http://192.168.45.175:5173"  // URL del frontend para CORS
      },
      env_production: {               // Variables para producción
        NODE_ENV: "production",
        PORT: 3003,
        QUIET: true,                  // Suprime los logs de dotenv
        FRONTEND_URL: "http://192.168.45.175:5173"  // URL del frontend para CORS
      }
    },
    {
      name: "letterbox-frontend",
      script: "./letterbox-frontend/node_modules/vite/bin/vite.js",  // Ruta directa al ejecutable de vite
      args: "preview --port 5173 --host",    // Comando para servir la build y permitir acceso externo
      cwd: "./letterbox-frontend",    // Directorio del frontend
      watch: false,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        HOST: "0.0.0.0"              // Permite conexiones desde cualquier IP
      },
      env_production: {
        NODE_ENV: "production",
        HOST: "0.0.0.0"              // Permite conexiones desde cualquier IP
      }
    }
  ]
}

//pm2 start ecosystem.config.cjs --env production