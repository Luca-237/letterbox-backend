module.exports = {
  apps: [
    {
      name: "letterbox-backend",
      script: "index.js",              
      watch: false,                    
      instances: 1,                   
      exec_mode: "fork",              
      autorestart: true,             
      max_memory_restart: "1G",      
      env: {                         
        NODE_ENV: "development",
        PORT: 3003,
        QUIET: true,                  
        FRONTEND_URL: "http://192.168.45.175:5173"  //Acá también iria la ip propia
      },
      env_production: {               
        NODE_ENV: "production",
        PORT: 3003,
        QUIET: true,                  
        FRONTEND_URL: "http://192.168.45.175:5173"  //Acá iria la ip propia
      }
    },
    {
      name: "letterbox-frontend",
      script: "./letterbox-frontend/node_modules/vite/bin/vite.js",  
      args: "preview --port 5173 --host",    
      cwd: "./letterbox-frontend",   
      watch: false,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        HOST: "0.0.0.0"              
      },
      env_production: {
        NODE_ENV: "production",
        HOST: "0.0.0.0"              
      }
    }
  ]
}

//pm2 start ecosystem.config.cjs --env production (comando para levantarlo con pm2)
