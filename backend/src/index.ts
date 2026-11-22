import { config } from "./config/index.js";
import { prisma } from "./db/prisma.js";
import { createApp } from "./server/app.js";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
