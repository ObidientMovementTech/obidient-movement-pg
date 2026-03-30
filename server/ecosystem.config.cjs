module.exports = {
  apps: [
    // ── Main API Server ──
    {
      name: 'obidient-api',
      script: 'server.js',
      cwd: '/var/www/obidient-movement-pg/server',
      instances: parseInt(process.env.API_PROCESSES) || 1,
      exec_mode: 'cluster',
      node_args: '--enable-source-maps',
      max_memory_restart: '512M',
      exp_backoff_restart_delay: 5000,
      max_restarts: 10,
      kill_timeout: 15000,
      listen_timeout: 15000,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },

    // ── SMS Worker ──
    {
      name: 'obidient-sms-worker',
      script: 'workers/smsWorker.js',
      cwd: '/var/www/obidient-movement-pg/server',
      instances: parseInt(process.env.SMS_WORKER_PROCESSES) || 1,
      exec_mode: 'fork',
      node_args: '--enable-source-maps',
      max_memory_restart: '256M',
      exp_backoff_restart_delay: 5000,
      max_restarts: 10,
      kill_timeout: 15000,
      env: {
        NODE_ENV: 'production',
      },
    },

    // ── Voice Worker ──
    {
      name: 'obidient-voice-worker',
      script: 'workers/voiceWorker.js',
      cwd: '/var/www/obidient-movement-pg/server',
      instances: parseInt(process.env.VOICE_WORKER_PROCESSES) || 1,
      exec_mode: 'fork',
      node_args: '--enable-source-maps',
      max_memory_restart: '256M',
      exp_backoff_restart_delay: 5000,
      max_restarts: 10,
      kill_timeout: 15000,
      env: {
        NODE_ENV: 'production',
      },
    },

    // ── Email Broadcast Worker ──
    {
      name: 'obidient-email-worker',
      script: 'workers/emailBroadcastWorker.js',
      cwd: '/var/www/obidient-movement-pg/server',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--enable-source-maps',
      max_memory_restart: '256M',
      exp_backoff_restart_delay: 5000,
      max_restarts: 10,
      kill_timeout: 15000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
