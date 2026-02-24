/**
 * Seed Clerk users for development.
 *
 * Usage:
 *   bun run packages/api/scripts/seed-users.ts admin@example.com "Admin User"
 *   bun run packages/api/scripts/seed-users.ts --file users.json
 *
 * JSON file format:
 *   [{ "email": "admin@example.com", "firstName": "Admin", "lastName": "User" }]
 */
import { createClerkClient } from '@clerk/backend';
import { readFileSync } from 'node:fs';

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.error('CLERK_SECRET_KEY is required');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });

interface UserSeed {
  email: string;
  firstName?: string;
  lastName?: string;
}

async function upsertUser(user: UserSeed) {
  // Check if user already exists
  const existing = await clerk.users.getUserList({
    emailAddress: [user.email],
  });

  if (existing.data.length > 0) {
    console.log(`User already exists: ${user.email} (${existing.data[0].id})`);
    return existing.data[0];
  }

  const created = await clerk.users.createUser({
    emailAddress: [user.email],
    firstName: user.firstName,
    lastName: user.lastName,
  });

  console.log(`Created user: ${user.email} (${created.id})`);
  return created;
}

async function main() {
  const args = process.argv.slice(2);

  let users: UserSeed[];

  if (args[0] === '--file') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Usage: --file <path-to-json>');
      process.exit(1);
    }
    users = JSON.parse(readFileSync(filePath, 'utf-8'));
  } else if (args.length >= 1) {
    const [email, name] = args;
    const [firstName, ...lastParts] = (name ?? '').split(' ');
    users = [
      {
        email,
        firstName: firstName || undefined,
        lastName: lastParts.join(' ') || undefined,
      },
    ];
  } else {
    console.error(
      'Usage: seed-users.ts <email> [name] | seed-users.ts --file <path>',
    );
    process.exit(1);
  }

  for (const user of users) {
    await upsertUser(user);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
