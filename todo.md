# QuestLog Pro — TODO / Improvement Roadmap

## 🎮 Feature Enhancements

- [ ] **Sub-Quests / Quest Chains** — Add a `parentQuestId` to the `quests` table to support hierarchical quests and quest chains.
- [ ] **Achievements & Badges** — Create an `achievements` table (e.g., "Complete 10 quests", "Reach Level 5", "First Guild Created") to boost engagement.
- [ ] **Quest Comments / Activity Feed** — Add user-facing comments on quests for collaboration, especially within guilds.
- [ ] **Recurring Quests (Dailies/Weeklies)** — Add a `recurrence` field to the `quests` table with auto-regeneration logic for habit-tracking.
- [ ] **Quest Tags / Labels** — Add user-defined tags (e.g., "Sprint 4", "Frontend", "Bug") via a `quest_tags` join table for flexible categorization.
- [ ] **Inventory / Rewards System** — Expand beyond XP with virtual items or titles earned for quest completion.

## 👥 Guild Improvements

- [ ] **Guild Quest Board** — A dedicated board where guild admins can post quests for any member to claim.
- [ ] **Guild Leaderboard** — Aggregate XP across guild members and display rankings.
- [ ] **Guild Announcements / Chat** — Simple announcement or messaging feature within guilds.

## 🛠️ Technical Improvements

- [ ] **Testing Infrastructure** — Add a testing framework (Vitest or Jest + React Testing Library) and write tests for server actions and critical components.
- [ ] **CI/CD Pipeline** — Add a GitHub Actions workflow for linting, type-checking, and automated tests on PRs.
- [ ] **Error Handling & Loading States** — Add error boundaries, toast notifications for quest actions, and skeleton loading states.
- [ ] **Mobile Touch Support** — Add `TouchSensor` and `KeyboardSensor` to the Kanban board for better mobile and accessibility support.
- [ ] **Database Indexes** — Add indexes on frequently queried columns (`quests.userId`, `quests.guildId`, `quests.status`, `guildMembers.userId`).

## 📋 Repository & DX Improvements

- [ ] **Update the README** — Replace the default Next.js README with project-specific docs (setup, env vars, migrations).
- [ ] **Clean up `Details.md`** — Remove or clarify the Azure infrastructure content that doesn't relate to QuestLog Pro.
- [ ] **Add a License** — Add a license file (e.g., MIT) to clarify usage rights.
- [ ] **Environment Variable Documentation** — Create a `.env.example` file documenting required env vars (database URL, NextAuth secrets, nodemailer config).

## 🎨 UX Improvements

- [ ] **Due Date Notifications** — Connect `dueDate` with `nodemailer` to send email reminders for approaching deadlines.
- [ ] **Quest Filtering & Search** — Add filtering by quest type, priority, date range, and text search on the Kanban/quest list views.
- [ ] **Dashboard Analytics** — Show stats like quests completed this week, XP trends, and streaks.
- [ ] **Keyboard Shortcuts** — Add shortcuts for creating quests, switching views, and navigating columns.