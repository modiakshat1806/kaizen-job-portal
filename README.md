# Kaizen Job Portal - Hackathon Project

A full-stack job portal application built for hackathon with student assessment, career matching, and job posting features.

## Features

### Frontend (React + Vite)
- **Student Assessment**: Step-by-step assessment form
- **Career Match**: Display career recommendations based on assessment
- **Job Posting Form**: Company job creation interface
- **Job Detail Page**: View job details with fitment scoring
- **QR Code Scanner**: Scan job QR codes for quick access
- **QR Code Preview**: Display QR codes for job postings

### Backend (Node.js + Express)
- **Student Management**: Save and retrieve student assessment data
- **Job Posting**: Create and manage job postings
- **Fitment Algorithm**: Calculate job-student compatibility scores
- **QR Code Generation**: Generate QR codes for job postings

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for form handling
- QR Code libraries

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- UUID for job IDs
- CORS and JSON middleware
- Environment variables support

## Project Structure

```
kaizen-job-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

#### Option 1: Automated Setup
```bash
# Run the setup script (recommended)
node setup.js
```

#### Option 2: Manual Setup

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd kaizen-job-portal
```

2. **Install dependencies:**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. **Environment Setup:**
```bash
# In server directory, create .env file
cd ../server
cp env.example .env
# Edit .env with your MongoDB connection string
```

4. **Start the development servers:**
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory, in new terminal)
cd ../client
npm run dev
```

### MongoDB Setup

#### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. The default connection string is: `mongodb://localhost:27017/kaizen-job-portal`

#### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update the `.env` file

### Running the Application

1. **Start the backend server:**
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

2. **Start the frontend application:**
```bash
cd client
npm run dev
```
Frontend will run on http://localhost:3000

3. **Open your browser and navigate to:**
   - http://localhost:3000 - Main application
   - http://localhost:5000/health - API health check

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kaizen-job-portal
NODE_ENV=development
```

## API Endpoints

### Students
- `POST /api/student` - Save student assessment
- `GET /api/student/:phone` - Get student by phone

### Jobs
- `POST /api/job` - Create new job posting
- `GET /api/job/:id` - Get job by ID
- `GET /api/fitment/:studentPhone/:jobId` - Calculate fitment score

## Development

### Frontend Development
- Hot reload with Vite
- TailwindCSS for styling
- React Router for navigation
- Component-based architecture

### Backend Development
- Express.js with middleware
- MongoDB with Mongoose ODM
- RESTful API design
- Error handling and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your hackathon! 