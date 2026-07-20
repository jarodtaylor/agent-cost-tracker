import { db } from "../app/db/db.server";
import {
  createSubscription,
  listSubscriptions,
} from "../app/db/subscriptions.server";

if (listSubscriptions(db).length > 0) {
  console.log("Seed skipped: subscriptions already exist.");
} else {
  const examples = [
    {
      name: "Claude Pro",
      vendor: "Anthropic",
      monthlyCost: 2_000,
      renewalDate: "2026-08-01",
      notes: "Primary coding assistant",
    },
    {
      name: "ChatGPT Plus",
      vendor: "OpenAI",
      monthlyCost: 2_000,
      renewalDate: "2026-08-15",
      notes: null,
    },
    {
      name: "GitHub Copilot",
      vendor: "GitHub",
      monthlyCost: 1_000,
      renewalDate: "2026-09-01",
      notes: "IDE completion",
    },
  ];

  for (const example of examples) {
    createSubscription(db, example);
  }

  console.log(`Seeded ${examples.length} subscriptions.`);
}
