This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

redeploying 
 

 09/08/2025
 
✅ TODO: Make dashboard responsive for only mobile 
✅ TODO: Add title of "Your Strategy" to strategy section
🕐 TODO: Strategy section should have more info/checkpoints 
- TODO: Add goals button + popup to approove, edit or add goals as they want
- TODO: Add database functionality for adding goals
- TODO: Add functionality for adding daily quests
- TODO: (AI generates goals from strategy sections)
- TODO: Add functionality for adding daily quests
- TODO: (AI generates daily quests from goals and everything can be stored and tracked)
- TODO: If user has no quests, no daily quests should be displayed in quests card
- TODO: Add more details to coming soon for coach and friends so users know what to expect
- TODO: Clicking feedback should redirect to featurebase

## Guest results and regression checks

Completing a quiz while signed out now opens `/results/<private-token>`. The full strategy is readable before sign-in. Visitors can email themselves the reopening link or explicitly save the existing report to an account. Keep report links private: possession of the link grants read access. Tokens are random, only their hashes are stored, and results pages suppress analytics, indexing, and referrers.

Email uses the existing `RESEND_API_KEY`, a verified `reports@future-u.app` sender, and the canonical `NEXTAUTH_URL`. The email action does not enroll recipients in marketing. Real provider delivery and the deployed Google callback should be smoke-tested after release.

- `npm run test:unit` runs access, validation, generation-failure, and account-claim tests, including a disposable MongoDB instance. The first run downloads a local MongoDB test binary.
- `npm run test:regressions` runs the quiz, draft, mobile, avatar, guest-results, and account-save browser regressions on port 3107. These tests mock provider responses and the browser session; they never call production AI or email services.
- `npm run build` checks the production bundle, lint, and types.

For a local visual preview, point `.env.local` at `mongodb://127.0.0.1:27099/future_u_verification`, set `NEXTAUTH_URL=http://localhost:3107`, and run `node scripts/preview-guest-results.mjs` alongside `npm run dev -- --port 3107`. The script prints a local report URL, seeds fictional data only, and removes the disposable database when stopped. Do not use production service credentials for this preview.
