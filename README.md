# COMPSCI 705 Group Project

## 🌐 Live Demo

**Deployed Application**: [https://705group6.duckdns.org/](https://705group6.duckdns.org/)

> ⚠️ **Important Note**: The server is currently hosted on a 2-core CPU instance. Due to computational limitations, **parallel questionnaire submissions are not supported**. We recommend exploring the admin dashboard features for the best experience.

### Test Account
For testing purposes, use the following admin account:
- **Username**: `admin-test`
- **Password**: `123456`

---

## 📖 Overview

This is a full-stack mental health assessment application that combines traditional questionnaire methods with advanced AI-powered emotion recognition. The system analyzes both subjective questionnaire responses and objective facial/vocal emotion patterns from video recordings to provide comprehensive mental health insights.

### Key Features

- 🎥 **Dual-Stream Emotion Recognition**: Integrates Speech Emotion Recognition (SER) and Facial Emotion Recognition (FER)
- 📊 **Advanced Analytics Dashboard**: Real-time statistical analysis with interactive visualizations
- 🔐 **Role-Based Access Control**: Separate interfaces for users and administrators
- 📹 **Video Recording & Analysis**: Automatic emotion detection from user-submitted video responses
- 📈 **Correlation Analysis**: Spearman correlation between subjective and objective measures
- 🎨 **Modern UI/UX**: Responsive design with intuitive navigation and visual feedback

---

## 🏗️ Architecture

```
Compsci_705_group_project/
│
├── client/                              # React Frontend Application
│   ├── public/                          # Static assets
│   └── src/
│       ├── api/                         # API client & HTTP configuration
│       ├── components/                  # Reusable UI components
│       ├── context/                     # Global state management
│       ├── pages/                       # Page components (User & Admin)
│       └── App.js                       # Main application entry
│
├── server/                              # Express Backend Server
│   ├── config/                          # Database configuration
│   ├── controllers/                     # Business logic handlers
│   ├── middleware/                      # Authentication & authorization
│   ├── models/                          # MongoDB schemas
│   ├── routes/                          # API endpoints
│   └── server.js                        # Server entry point
│
├── python/                              # AI Emotion Recognition Module
│   └── ER_FullClip_DEMO.py             # Video/audio analysis script
│
└── Emotion-Recognition_SER-FER_RAVDESS/ # Pre-trained AI Models
    ├── Datasets/                        # Training data & scalers
    ├── Models/                          # Audio & Video models
    └── Other/                           # Supporting files (Haar Cascade, etc.)
```

### Frontend (`client/`)
- **Framework**: React 19 with Create React App
- **Routing**: React Router DOM 7
- **State Management**: Context API for global auth state
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts for data visualization
- **Media**: MediaRecorder API for video capture

#### User Features
- Interactive questionnaire with emoji-based responses
- Real-time video recording during question answering
- Progress tracking and answer review
- Detailed result visualization with correlation analysis

#### Admin Features
- Overview dashboard with KPI metrics
- Questionnaire management
- Individual submission reports
- Statistical analysis with adjustable parameters
- Export functionality

### Backend (`server/`)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **File Upload**: Multer for multipart/form-data
- **Video Processing**: FFmpeg for audio extraction
- **CORS**: Configured for cross-origin requests

#### API Structure
- `/api/auth/*` - Authentication endpoints
- `/api/public/user/*` - User questionnaire access
- `/api/user/*` - Protected user endpoints
- `/api/admin/*` - Admin-only endpoints

### Emotion Recognition Model (`python/`)
- **Framework**: TensorFlow 2.9 with Keras
- **Dataset**: RAVDESS (Ryerson Audio-Visual Database of Emotional Speech and Song)
- **Emotions Detected**: Angry, Calm, Disgust, Fear, Happy, Sad, Surprise
- **Video Model**: CNN for facial expression recognition from grayscale face frames
- **Audio Model**: CNN for mel-spectrogram-based speech emotion recognition
- **Fusion**: Combined prediction from both streams

---

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- React Router DOM 7.7.1
- Axios 1.11.0
- Recharts 3.2.1
- Create React App 5.0.1

### Backend
- Node.js (LTS recommended)
- Express 5.1.0
- Mongoose 8.17.0
- JSON Web Token 9.0.2
- Bcryptjs 3.0.2
- Multer 1.4.5
- Fluent-FFmpeg 2.1.3
- Simple Statistics 7.8.8

### Python (Emotion Recognition)
- Python 3.10.6
- TensorFlow 2.9.1
- Keras 2.9.0
- OpenCV 4.6.0.66
- Librosa 0.9.2
- MoviePy 1.0.3
- NumPy 1.24.2
- Scikit-learn 1.2.1

### Database
- MongoDB Atlas (Cloud-hosted)

---

---

## 🚀 Getting Started

### Prerequisites

#### Development Environment
- **IDE**: Visual Studio Code ([download](https://code.visualstudio.com/)) or JetBrains WebStorm ([download](https://www.jetbrains.com/webstorm/))
- **Node.js**: v18.x LTS or higher ([download](https://nodejs.org/))
- **Python**: 3.10.6 (exact version required)
  - Windows: [Python 3.10.6 installer](https://www.python.org/ftp/python/3.10.6/python-3.10.6-amd64.exe)
  - macOS: [Python 3.10.6 installer](https://www.python.org/ftp/python/3.10.6/python-3.10.6-macos11.pkg)
- **MongoDB**: Atlas account (free tier) or local MongoDB instance

Verify installations:
```bash
node -v        # Should show v18.x or higher
npm -v         # Should show 9.x or higher
python --version   # Should show Python 3.10.6
```

---

### Installation

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Compsci_705_group_project
```

#### 2. Set Up Backend (Node.js)

```bash
cd server
npm install
```

Create `.env` file in the `server/` directory:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

#### 3. Set Up Frontend (React)

```bash
cd ../client
npm install
```

#### 4. Set Up Python Environment

**Clone the emotion recognition model repository:**
```bash
cd ..
git clone https://github.com/gianscuri/Emotion-Recognition_SER-FER_RAVDESS.git
cd Emotion-Recognition_SER-FER_RAVDESS
```

**Create and activate virtual environment:**

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

**Install Python dependencies:**
```bash
pip install -r ../requirement.txt
```

---

### Running the Application

You need **three terminal windows** to run all components:

#### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

#### Terminal 2: Frontend Development Server
```bash
cd client
npm start
```
The React app will open automatically at `http://localhost:3000`

#### Terminal 3: Python Virtual Environment
Keep the Python virtual environment activated for emotion recognition:
```bash
# Windows
.venv\emotion\Scripts\activate

# macOS/Linux
source .venv/emotion/bin/activate
```

The backend will spawn Python processes automatically when needed.

---

## 🧠 Emotion Recognition Model

### Model Architecture

The system uses a **two-stream approach** combining facial and vocal emotion signals:

#### Video Stream (FER)
- Extracts 50 frames from each video clip
- Detects faces using Haar Cascade classifier
- Processes 112×112 grayscale face images
- CNN architecture trained on RAVDESS facial expressions

#### Audio Stream (SER)
- Extracts 3-second audio segments
- Generates mel-spectrograms (128 mels × 282 time steps)
- Standardized features using pre-trained scaler
- CNN architecture trained on RAVDESS speech patterns

#### Fusion Strategy
- Averages predictions from both streams
- Emotion mapping for mental health assessment:
  - **Positive**: Happy (0.0), Surprise (0.1), Calm (0.2)
  - **Neutral**: Sad (0.3)
  - **Negative**: Fear (0.5), Disgust (0.7), Angry (1.0)

### Supported Emotions
1. **Angry** - High arousal negative emotion
2. **Calm** - Low arousal positive emotion
3. **Disgust** - Negative emotion with rejection
4. **Fear** - High arousal negative emotion
5. **Happy** - High arousal positive emotion
6. **Sad** - Low arousal negative emotion
7. **Surprise** - High arousal neutral emotion

### Analysis Output
- Per-video emotion classification
- Normalized emotion scores (0-1 scale)
- Spearman correlation with questionnaire responses
- Statistical significance (p-value)

---


## 🌍 Deployment

The application is deployed on AWS with the following configuration:

- **Hosting**: AWS EC2 (2-core CPU instance)
- **Domain**: DuckDNS dynamic DNS service
- **Database**: MongoDB Atlas (Cloud)
- **URL**: [https://705group6.duckdns.org/](https://705group6.duckdns.org/)

### Known Limitations
- ⚠️ The 2-core CPU cannot handle parallel video processing
- Processing a single questionnaire submission takes 1-3 minutes
- Concurrent submissions may cause timeouts
- Recommended: Use admin dashboard for demonstration

---

##  Testing

### Using the Test Account

1. Navigate to [https://705group6.duckdns.org/](https://705group6.duckdns.org/)
2. Click "Login" and use:
   - Username: `admin-test`
   - Password: `123456`
3. Explore the admin dashboard features:
   - View aggregated statistics
   - Review individual submissions
   - Analyze emotion recognition results
   - Export reports

---

##  Contributing

This is an academic project for COMPSCI 705. For any questions or suggestions, please contact the project team.

---

##  License

This project incorporates the [Emotion Recognition SER-FER RAVDESS](https://github.com/gianscuri/Emotion-Recognition_SER-FER_RAVDESS) model, which is licensed under its own terms. Please refer to the original repository for model-specific licensing information.

---

##  Acknowledgments

- **RAVDESS Dataset**: Ryerson Audio-Visual Database of Emotional Speech and Song
- **Emotion Recognition Model**: Based on work by [gianscuri](https://github.com/gianscuri)
- **University of Auckland**: COMPSCI 705 Course Staff

---

