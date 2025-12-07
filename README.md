# Smart Submissions - Job Candidate Platform

A full-stack web application built with React.js and MongoDB that allows job candidates to register, login, manage their profiles, and submit resumes.

## Features

- **User Authentication**
  - User registration with email and password
  - Secure login with JWT tokens
  - Password hashing with bcrypt

- **Profile Management**
  - Edit personal information (name, contact details, address)
  - Add biography
  - Manage skills
  - Track work experience
  - Track education history

- **Resume Management**
  - Upload resume files (PDF, DOC, DOCX)
  - View all uploaded resumes
  - Set active resume
  - Delete resumes
  - File size limit: 5MB

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management

## Project Structure

```
smart-submissions/
├── server/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── models/
│   │   ├── User.js               # User model
│   │   └── Resume.js             # Resume model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── profile.js            # Profile routes
│   │   └── resume.js             # Resume routes
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── package.json
│   └── server.js                 # Server entry point
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Register.js
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Dashboard.css
│   │   │   ├── Profile.js
│   │   │   ├── Profile.css
│   │   │   ├── ResumeUpload.js
│   │   │   └── ResumeUpload.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### 1. Clone the repository (not necessary)
```bash
git clone <repository-url>
cd smart-submissions
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` file and update the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-submissions
JWT_SECRET=your_secure_random_secret_key
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 3. Install backend dependencies
```bash
cd server
npm install
```

### 4. Install frontend dependencies
```bash
cd ../client
npm install
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 6. Run the application

#### Option 1: Run backend and frontend separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

#### Option 2: Run both concurrently (from root directory)
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)
- `POST /api/profile/experience` - Add experience (protected)
- `PUT /api/profile/experience/:id` - Update experience (protected)
- `DELETE /api/profile/experience/:id` - Delete experience (protected)
- `POST /api/profile/education` - Add education (protected)
- `PUT /api/profile/education/:id` - Update education (protected)
- `DELETE /api/profile/education/:id` - Delete education (protected)

### Resume
- `POST /api/resume/upload` - Upload resume (protected)
- `GET /api/resume` - Get all resumes (protected)
- `GET /api/resume/active` - Get active resume (protected)
- `PUT /api/resume/active/:id` - Set active resume (protected)
- `DELETE /api/resume/:id` - Delete resume (protected)
- `GET /api/resume/download/:id` - Download resume (protected)

## Usage

1. **Register**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your profile status and quick links
4. **Profile**: Edit your personal information, add skills, experience, and education
5. **Resume**: Upload and manage your resume files

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes requiring authentication
- File type validation for resume uploads
- File size limits (5MB)
- Input validation using express-validator

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd client
npm start  # React development server with hot reload
```

## Build for Production

### Frontend Build
```bash
cd client
npm run build
```

This creates an optimized production build in the `client/build` folder.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/smart-submissions |
| JWT_SECRET | Secret key for JWT signing | (required) |
| NODE_ENV | Environment mode | development |

## Future Enhancements

- Email verification
- Password reset functionality
- Admin dashboard
- Job listings integration
- Application tracking
- Real-time notifications
- Profile picture upload
- Resume parsing
- Multiple resume versions
- Export profile as PDF

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
