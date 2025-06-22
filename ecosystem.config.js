module.exports = {
  apps: [{
    name: 'mini-crm',
    script: '/app/dist/src/main.js',
    instances: '8',
    exec_mode: 'cluster',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    max_restarts: 5,
    min_uptime: '10s',
    restart_delay: 2000,
    env: {
      NODE_ENV: 'development',
      APP_PORT: 3002,
      APP_HOST: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      APP_PORT: 3002,
      APP_HOST: '0.0.0.0'
    },
    log_file: '/app/logs/combined.log',
    out_file: '/app/logs/out.log',
    error_file: '/app/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
