require("./server/config/config");
const server = require("./server/server");

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});