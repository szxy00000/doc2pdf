module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      "name"   : "doc-exchange-server:dev",
      "script" : "index.js",
      "exec_interpreter": "node",
      "exec_mode": "fork_mode",
      "env": {
        "NODE_ENV": "development",
        // 本机调试时的开关
        "DEBUG": true,
      },
      "ignore_watch": [".git", "uploads", "uploads-other", "pngFolder", "uploads-chunk"]
    }
  ]
}
