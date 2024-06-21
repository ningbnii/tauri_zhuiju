const ENV = process.env.NODE_ENV
const ENV_CONFIG = {
  // 开发环境
  development: {
    // baseUrl: 'http://127.0.0.1:8787',
    // wsNoticeUrl: 'ws://127.0.0.1:3131',
    // wsGameUrl: 'ws://127.0.0.1:7272',
    baseUrl: 'http://localhost:30000',
    RESOURCE_SERVER: 'https://api.ffzyapi.com/',
  },
  //  生产环境
  production: {
    baseUrl: 'http://localhost:30000',
    RESOURCE_SERVER: 'https://api.ffzyapi.com/',
  },
}

export default {
  ...ENV_CONFIG[ENV],
}
