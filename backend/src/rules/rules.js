module.exports = {
  default: {
    limit: 100,
    window: 60,
  },

  routes: {
    "POST:/login": {
      limit: 5,
      window: 60,
    },

    "POST:/payment": {
      limit: 2,
      window: 60,
    },

    "GET:/products": {
      limit: 100,
      window: 60,
    },

    "GET:/profile": {
      limit: 50,
      window: 60,
    },
  },
};
