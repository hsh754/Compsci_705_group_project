## COMPSCI 705 Group Project

#### Overview
A full-stack survey demo with role-based access control.
- Client: React + React Router, global auth state, responsive UI
- Server: Express + JWT auth + Mongoose models, role middleware
- Roles: `user` and `admin` with different navigation and routes

#### Architecture
- `client/` React app (CRA):
  - Auth context stores `token` and `user { username, email, role }`
  - User Pages: `Dashboard`, `Questionnaire`, `Results`, `Profile`
  - Admin Pages: `Admin Overview`, `Questionnaires`, `Reports`, `Settings`
  - Route guards: login guard and role guard
- `server/` Node/Express API:
  - Auth: register, login, get profile
  - User endpoints: overview, questionnaire list, results (placeholders)
  - Admin endpoints: overview, questionnaire list, reports, settings (placeholders)
  - Middleware: `protect` (JWT), `requireRole('admin')`

#### Tech Stack
- Client: React 19, react-router-dom 7, axios
- Server: Express 5, Mongoose 8, JSON Web Token, bcryptjs, dotenv, CORS


#### Directory Structure
```
client/
  src/
    api/http.js
    components/Navbar.js
    context/AuthContext.js
    pages/
      HomePage.js
      LoginPage.js
      RegisterPage.js
      ProfilePage.js
      Dashboard.js
      Questionnaire.js
      Results.js
      admin/
        AdminDashboard.js
        AdminQuestionnaires.js
        AdminReports.js
        AdminSettings.js
server/
  server.js
  routes/
    routes.js
    api/
      api.js
      user.js
      public.js
      admin.js
  controllers/
    userController.js
  middleware/
    auth.js
  models/
    user.js
    questionnaire.js
  config/db.js
```
#### Prerequisites
- IDE: **Visual Studio Code** or **JetBrains WebStorm**
  - VS Code: [code.visualstudio.com](https://code.visualstudio.com/)
  - WebStorm: [jetbrains.com/webstorm](https://www.jetbrains.com/webstorm/)
- Node.js 与 npm（Install from the official website. LTS version is recommended）
  - Node.js: [nodejs.org](https://nodejs.org/)
  - Verify the version after installation：
    - Windows PowerShell / macOS / Linux
      ```bash
      node -v
      npm -v
      ```
      
#### Environment Variables
- Server (`server/.env`):
```
PORT=5000
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-atlas-connection-string
```
#### Python Environment Setup

This project requires **Python 3.10.6** to run the emotion recognition model inference.  
Follow the steps below to set up the environment:

1. **Install Python 3.10.6**
  - **Windows**: Download and install from the [official Python download page](https://www.python.org/ftp/python/3.10.6/python-3.10.6-amd64.exe).
  - **macOS**: Download and install from the [official Python download page](https://www.python.org/ftp/python/3.10.6/python-3.10.6-macos11.pkg).

   Verify the installation:
   ```bash
   python --version
   # or
   python3 --version
   ```
   Expected output:
   ```
   Python 3.10.6
   ```

2. **Clone the Model Repository**
   In the project root directory, clone the required emotion recognition repository:
   ```bash
   git clone https://github.com/gianscuri/Emotion-Recognition_SER-FER_RAVDESS.git
   cd Emotion-Recognition_SER-FER_RAVDESS
   ```

3. **Create a Virtual Environment (named `emotion`)**
   Use Python 3.10.6 to create and activate a dedicated virtual environment:
  - **Windows (PowerShell)**:
    ```powershell
    py -3.10 -m venv .venv/emotion
    .venv\emotion\Scripts\activate
    ```
  - **macOS / Linux (bash/zsh)**:
    ```bash
    python3.10 -m venv .venv/emotion
    source .venv/emotion/bin/activate
    ```

   Once activated, your terminal should show the prefix `(emotion)`.

4. **Install Dependencies**
   Inside the activated virtual environment, install all required packages:
   ```bash
   pip install -r requirement.txt
   ```

   The provided `requirements.txt` file ensures a fully reproducible environment.

#### Run (Windows PowerShell)
PowerShell does not support `&&` by default. Use `;` to chain commands or run in separate terminals.
  - **Start Frontend**:
```powershell
cd server 
npm install
npm run dev
```
- **Start Backend**:
```powershell
# open a new terminal
cd client 
npm install 
npm start
```

#### Frontend Routes
- Public: `/` (Home), `/login`, `/register`
- User (login required): `/dashboard`, `/questionnaire`, `/results`, `/profile`
- Admin (admin role required): `/admin`, `/admin/questionnaires`, `/admin/reports`, `/admin/settings`

#### API Endpoints (placeholders unless noted)
- Auth
  - `POST /api/users/register` → `{ token, user }` (defaults to role `user`)
  - `POST /api/users/login` → `{ token, user }`
  - `GET /api/users/profile` (JWT)
- User
  - `GET /api/public/user/overview` (JWT)
  - `GET /api/public/user/questionnaires` (JWT)
  - `GET /api/public/user/results` (JWT)
- Admin (JWT + role admin)
  - `GET /api/admin/overview`
  - `GET /api/admin/questionnaires`
  - `GET /api/admin/reports`
  - `GET /api/admin/settings`, `PUT /api/admin/settings`

#### Roles & Permissions
- New registrations are `user` by default.
- To grant admin:
  - In MongoDB Atlas (collection `users`), set `{ role: 'admin' }` for the target user.
  - Example (mongosh):
  ```js
  db.users.updateOne({ username: "admin" }, { $set: { role: "admin" }})
  ```

#### Admin Test Account
- A ready-to-use admin account is available for testing:
  - Username: `admin-test`
  - Password: `123456`

