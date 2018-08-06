module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      "name"   : "doc-exchange-server",
      "script" : "index.js",
      "exec_interpreter": "node",
      "exec_mode": "fork_mode",
      "env_production": {
        "NODE_ENV": "production",
        "USE_SESSION": true,
        "NEED_CHECK_AUTH": true
      },
      "ignore_watch": [".git", "uploads", "uploads-other", "pngFolder", "uploads-chunk", "zips"]
    }
  ]
}
