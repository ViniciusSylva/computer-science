# Restaurant Management & Digital Menu

## 📌 About
A full-stack application designed for end-to-end restaurant and kitchen operations. It integrates physical table management, categorized digital menus with customizable option groups, a finite state machine for order lifecycles, and a real-time Kitchen Display System (KDS) powered by Server-Sent Events (SSE).

## 🚀 Technologies
- TypeScript (Strict mode) & Node.js
- Express.js
- React 18 & Vite
- PostgreSQL 16 (Docker Compose)
- Prisma ORM (Schema migrations, relations & seed data)
- Tailwind CSS
- Server-Sent Events (SSE)
- Jest & Supertest

## 🧠 What I learned
- Modeling relational schemas with recursive options, historical pricing snapshots, and multi-table constraints using Prisma ORM.
- Implementing a deterministic Order State Machine (`RECEIVED` → `PREPARING` → `READY` → `DELIVERED` / `CANCELED`) preventing illegal lifecycle transitions.
- Delivering real-time streaming push notifications to frontend kitchen terminals via Server-Sent Events (SSE) without full polling overhead.
- Structuring decoupled REST controllers, unified error-handling middlewares, and automated test coverage across unit and integration levels.

## ⚠️ Challenges
- **Order State Integrity:** Ensuring order items preserve snapshot prices at order time even if the restaurant owner alters menu prices later.
- **Real-Time Synchronization:** Managing persistent SSE client connections, handling sudden network disconnections, and syncing live order statuses across kitchen and dining room screens.
- **Option Group Constraints:** Enforcing strict minimum and maximum selection rules on customizable item add-ons both at database validation and API route levels.

## 🔧 Improvements
- Complete full shopping cart checkout flow integration on customer-facing digital menu interface.
- Add payment gateway webhooks (e.g., Stripe or Pix) for automated order confirmation.
- Implement role-based access control (RBAC) separating kitchen staff, waitstaff, and restaurant administrative views.

## 🌎 About me
I am a Computer Science student in Brazil, focused on learning and continuous growth. I currently work at a technology company in the backend and automation field. I am still exploring different paths within technology to find my specialization, while developing practical projects and strengthening my foundation.
