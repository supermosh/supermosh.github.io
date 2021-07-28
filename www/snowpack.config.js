/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: '..',
  mount: {
    public: {
      url: '/',
      static: true,
    },
    src: {
      url: '/dist',
    },
  },
  plugins: [
    '@snowpack/plugin-typescript',
  ],
  routes: [
    {
      match: 'routes',
      src: '.*',
      dest: '/index.html',
    },
  ],
  buildOptions: {
    out: '../docs',
  },
};
