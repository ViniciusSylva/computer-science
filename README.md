# Full-Stack Project Manager

---

## 📌 About
A full-stack project management application built in a monorepo architecture. The project combines a dynamic PHP frontend with a Node.js REST API backed by a MySQL database via Prisma ORM, featuring asynchronous UI updates and modern styling.

## 🚀 Technologies
- Node.js & Express
- Prisma ORM & MySQL
- PHP
- JavaScript (Fetch API & cURL)
- HTML/CSS

## 🧠 What I learned
- Integrating heterogeneous full-stack architectures (PHP frontend consuming a Node.js REST API).
- Implementing asynchronous HTTP methods (`GET`, `POST`, `DELETE`) with the native Fetch API for real-time DOM updates without page reloads.
- Applying the **PRG (Post/Redirect/Get)** pattern in PHP to prevent duplicate form submissions on page refresh.
- Handling cross-origin requests by configuring **CORS** middleware in Express to allow explicit headers and HTTP methods.
- Separating frontend concerns into dedicated CSS stylesheets with custom responsive variables and visual feedback components.

## ⚠️ Challenges
- **Form Resubmission on Refresh:** Solved by refactoring the POST handling logic to use PHP sessions and the PRG pattern (`header('Location: index.php')`).
- **CORS Blockers on Asynchronous Deletions:** Resolved by enabling CORS middleware in Express and explicitly allowing preflight `OPTIONS` and `DELETE` methods.
- **Graceful Error Handling:** Handled non-2xx API HTTP responses in the client to display styled visual alerts instead of breaking the execution flow or relying on native browser alerts.

## 🔧 Improvements
- Implement updating (`PUT`/`PATCH`) capabilities for existing projects.
- Add client-side and server-side input sanitization for enhanced security.
- Integrate user authentication and JWT-based authorization across API endpoints.


## 🌎 About me
I am a Computer Science student in Brazil, focused on learning and continuous growth. I currently work at a technology company in the backend and automation field. I am still exploring different paths within technology to find my specialization, while developing practical projects and strengthening my foundation.