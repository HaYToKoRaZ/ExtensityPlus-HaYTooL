// Packages dist/ into extensity.zip, ready to upload to the Chrome Web Store
// or load unpacked for local testing.
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const OUT = "extensity.zip";

if (!existsSync("dist")) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

if (existsSync(OUT)) rmSync(OUT);

execSync(`cd dist && zip -r -X ../${OUT} .`, { stdio: "inherit" });
console.log(`\nWrote ${OUT}. Load it unpacked from dist/, or upload the zip to the Chrome Web Store.`);
