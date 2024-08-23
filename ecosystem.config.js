module.exports = {
  apps: [{
    name: 'development-api',
    script: 'node',
    args: ['--inspect','./dist/server.js'],
    cwd: "./server",
    watch: 'dist',
  },
    {
      name: 'development-react',
      script: 'npm',
      args: 'start',
      cwd: './client'
    },
    {
      name: 'development-tsc-w',
      script: 'tsc',
      args: '-w',
      cwd: './server'
    },
    {
      name: 'twine',
      script: 'npm',
      args: 'start',
      cwd: './client/modules/twine/twinejs'
    }
  ],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
