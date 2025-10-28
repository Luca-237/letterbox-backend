// ecosystem.config.js
module.exports = {
  apps : [
    {
      name: "letterbox-backend",
      script: "index.js",              // Ruta al archivo principal del backend
      cwd: ".",                        // Ejecutar desde la raíz del proyecto
      watch: false,                    // Desactiva el reinicio automático en cambios
      instances: 1,                    // Número de instancias a ejecutar
      exec_mode: "fork",              // Modo de ejecución
      autorestart: true,              // Reinicio automático si la app se cae
      max_memory_restart: "1G",       // Reiniciar si se excede este límite de memoria
      env: {                          // Variables de entorno por defecto
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {               // Variables para producción
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "letterbox-frontend",
      script: "npm",                  // Usamos npm directamente
      args: "run preview",            // Comando para ejecutar la versión de producción
      cwd: "./letterbox-frontend",    // Directorio del frontend
      watch: false,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
}