import { syncExistingUsersToFile } from "./utils/credentialLogger.js";

async function main() {
  try {
    await syncExistingUsersToFile();
    console.log("Credentials sync completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to sync credentials:", error);
    process.exit(1);
  }
}

main();
