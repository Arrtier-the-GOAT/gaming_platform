import "dotenv/config";
import { spawn } from "node:child_process";

const migrateProcess = spawn("npm exec -- drizzle-kit migrate", {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

migrateProcess.on("close", code => {
  process.exit(code === null ? 0 : code);
});

migrateProcess.on("error", error => {
  console.error("Migration runner failed:", error);
  process.exit(1);
});
