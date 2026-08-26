import { syncExistingUsersToFile } from "./utils/credentialLogger.js";

async function run() {
  console.log("Starting credentials sync from database...");
  await syncExistingUsersToFile();
  console.log("Credentials sync completed!");
  process.exit(0);
}

run();
