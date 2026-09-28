# Full-Stack Project Manager (PHP + Node.js)

## 📌 About
A full-stack project management application built using a monorepo architecture. The system integrates a dynamic PHP frontend (consuming data via cURL and native Fetch API) with a Node.js REST API backed by a MySQL database via Prisma ORM, featuring real-time asynchronous UI updates, custom visual error handling, and modern responsive CSS styling.

## 🚀 Technologies
- **Backend:** Node.js, Express, Prisma ORM, MySQL
- **Frontend:** PHP 8, JavaScript (Fetch API & cURL), HTML5, CSS3
- **Dev Tools:** Postman Flows, Git/GitHub, VS Code

## 📁 Repository Structure

/
├── api/                  # Node.js Express REST API & Prisma
│   ├── prisma/           # Database schema & migrations
│   ├── server.js         # API entry point & routes
│   └── package.json
├── web/                  # PHP Frontend
│   ├── index.php         # Main interface & PRG logic
│   └── style.css         # Modern responsive styles
├── .gitignore
└── README.md

## 🛠️ Setup & Local Installation

### Prerequisites
- Node.js (v18+)
- PHP (v8.0+)
- MySQL Server or XAMPP

---

### 1. Clone the Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

---

### 2. Configure & Run the Backend API (/api)

1. Navigate to the api directory:
cd api

2. Install Node.js dependencies:
npm install

3. Create a .env file in the api folder with your MySQL database connection string:
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/project_manager_db"
PORT=3000

4. Push the Prisma schema to set up your MySQL database tables:
npx prisma db push

5. Start the Node.js development server:
node server.js
(The API will start running at http://localhost:3000)

---

### 3. Configure & Run the PHP Frontend (/web)

1. Open a new terminal window and navigate to the web directory:
cd web

2. Start the built-in PHP development server:
php -S localhost:8000

3. Access the application in your browser at:
http://localhost:8000

---

## 🧠 What I Learned
- Architecting heterogeneous monorepo projects connecting a PHP frontend to a Node.js REST API.
- Executing asynchronous HTTP operations (GET, POST, DELETE) with the native Fetch API for instant DOM manipulation without page reloads.
- Applying the **PRG (Post/Redirect/Get)** pattern in PHP to prevent accidental duplicate form submissions on page refresh.
- Configuring **CORS** middleware in Express to securely manage cross-origin requests and preflight options.
- Designing responsive component layouts with CSS custom properties and graceful visual error banners for API validation status codes (HTTP 400/500).

## ⚠️ Challenges & Solutions
- **Form Resubmission Issue:** Solved by implementing PHP session flashing combined with the PRG pattern (`header('Location: index.php')`).
- **CORS Blockers during Asynchronous Deletions:** Fixed by configuring CORS middleware in Express to allow explicit headers and `DELETE` HTTP methods.
- **Graceful Error Handling:** Handled non-2xx API responses on the frontend to render styled alert boxes instead of relying on native browser popups or unhandled exceptions.

## 🔧 Future Improvements
- Implement project update (PUT/PATCH) capabilities in the interface.
- Add client-side and server-side input sanitization.
- Implement user authentication with JWT token security across endpoints.

## 🌎 About Me
I am a Computer Science student in Brazil, focused on learning and continuous growth. I currently work at a technology company in the backend and automation field. I am still exploring different paths within technology to find my specialization, while developing practical projects and strengthening my foundation.