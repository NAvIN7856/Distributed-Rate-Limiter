require("dotenv").config();

const app = require("./app");
require("./config/redis");
const { loadScript } = require("./services/luaLoader");
const PORT = process.env.PORT || 5000;

(async () => {
  await loadScript();

  app.listen(PORT, () => {
    console.log(`Server Running ${PORT}`);
  });
})();
