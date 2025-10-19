import "dotenv/config";
import { ensureAdminSeed } from "../lib/auth/admin";

ensureAdminSeed()
  .then(() => {
    console.info("Admin seed ensured");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed admin", error);
    process.exit(1);
  });
