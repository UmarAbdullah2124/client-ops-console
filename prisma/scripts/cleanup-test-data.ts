import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// tests/projects.spec.ts creates a real Project row per test run, titled
// `${prefix}${Date.now()}`, against the shared dev database (CI and local
// dev both point at the same Neon instance - see .github/workflows/
// playwright.yml). Nothing deletes those rows afterwards, so repeated runs
// slowly grow the table until every GetProjects query - and every test
// that depends on one - gets slow. Run this after the suite to keep it
// from reaccumulating. Keep this list in sync with the title prefixes
// actually used in tests/projects.spec.ts.
const TEST_TITLE_PREFIXES = ["Test Project ", "Keyboard Test Project ", "Review Drop Test "];

async function main() {
  const result = await prisma.project.deleteMany({
    where: {
      OR: TEST_TITLE_PREFIXES.map((prefix) => ({ title: { startsWith: prefix } })),
    },
  });
  console.log(`Deleted ${result.count} test-created project row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
