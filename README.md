# SkillForge

SkillForge is a full-stack student collaboration platform designed to help students discover peers with complementary skills, build meaningful connections, collaborate on projects, find hackathon teammates, and communicate through an integrated messaging system.

The platform brings student networking, project collaboration, and team formation into one place.

## Live Demo

**Live Application:** https://skillforge-kappa-tan.vercel.app/

> Note: The backend is hosted on a free-tier service. The first request after a period of inactivity may take a little longer while the server starts.

---

## About the Project

Students often have useful technical and creative skills but struggle to find the right people to collaborate with.

For example:

- A frontend developer may need a backend developer for a project.
- A programmer may need a UI/UX designer for a hackathon team.
- A beginner may want to connect with students who have experience in a particular technology.
- Students with project ideas may struggle to find interested collaborators.

SkillForge was built to make this process easier by creating a dedicated collaboration platform for students.

---

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Protected application routes
- Persistent login sessions

### Student Discovery

- Discover other students on the platform
- View detailed user profiles
- Explore skills offered by users
- Discover skills users want to learn
- Find potential collaborators based on interests and skills

### User Profiles

Users can maintain profiles containing:

- Name
- Profile picture
- College
- Location
- Bio
- Skills offered
- Skills wanted
- GitHub profile
- LinkedIn profile

### Connection System

- Send connection requests
- View incoming requests
- Accept or reject requests
- Build a network of collaborators

### Projects

- Discover student projects
- View project information
- Explore collaboration opportunities
- Join or request participation in projects

### Hackathons

- Explore hackathon opportunities
- Discover trending hackathons
- Find potential teammates
- Connect with students interested in participating

### Messaging

- Communicate with other users through the platform
- View conversations and messages
- Stay connected with collaborators

### Responsive Design

SkillForge is designed to work across desktop computers, laptops, tablets, and mobile devices.

The interface includes responsive navigation, adaptive layouts, mobile-friendly cards, and scrollable modal components.

---

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- REST APIs

### Cloud and Deployment

- Vercel — frontend deployment
- Render — backend deployment
- MongoDB Atlas — cloud database
- Cloudinary — media storage
- GitHub — version control and source code management

---

## System Architecture

```text
User
  |
  v
React Frontend
(Vercel)
  |
  | REST API Requests
  v
Node.js + Express Backend
(Render)
  |
  +-------------------+
  |                   |
  v                   v
MongoDB Atlas      Cloudinary
Database           Media Storage
```

---

## Project Structure

```text
skillforge/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## Main Application Sections

The authenticated dashboard is divided into four main sections:

### Students

Discover other users, explore their profiles and skills, and connect with potential collaborators.

### Projects

Explore student projects and find opportunities to contribute and collaborate.

### Hackathons

Discover hackathon opportunities and find students interested in forming teams.

### Messages

Communicate directly with connections and collaborators through the platform.

---

## Installation and Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Bhumie/skillforge.git
cd skillforge
```

### 2. Backend Setup

Move into the backend directory and install the dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and configure the required environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:

```bash
npm start
```

The backend will run locally on the configured port.

### 3. Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

For production API configuration, set the frontend environment variable:

```env
VITE_API_URL=your_backend_api_url
```

---

## API Overview

The backend is organized into REST API modules for:

```text
/api/auth
/api/users
/api/connections
/api/messages
/api/projects
/api/hackathons
```

These APIs handle authentication, profile management, connections, messaging, projects, and hackathon-related functionality.

---

## Deployment Architecture

SkillForge uses separate frontend and backend deployments:

```text
Frontend
React + Vite
      |
      v
Vercel
      |
      | HTTPS API Requests
      v
Render
Node.js + Express
      |
      v
MongoDB Atlas
```

This architecture allows the frontend and backend to be updated and deployed independently.

---

## Challenges and Learnings

Building SkillForge involved working through several practical full-stack development challenges:

- Designing and integrating REST APIs
- Implementing JWT-based authentication
- Creating protected frontend routes
- Managing communication between the frontend and backend
- Building a connection-request workflow
- Designing responsive layouts for different screen sizes
- Managing environment variables across development and production
- Configuring CORS for deployed applications
- Deploying a monorepo with separate frontend and backend services
- Configuring SPA routing for production
- Connecting a cloud-hosted backend with a cloud database
- Debugging and testing complete end-to-end user flows

This project provided practical experience in building, debugging, integrating, and deploying a complete full-stack MERN application.

---

## Future Improvements

Planned improvements include:

- Real-time messaging using Socket.IO
- Real-time notifications
- Improved skill-based student recommendations
- Advanced search and filtering
- Enhanced hackathon team formation
- Improved project collaboration workflows
- Better notification management
- Additional profile customization
- Performance and scalability improvements

---

## Project Status

SkillForge is currently **deployed and functional**.

Core features including authentication, student discovery, user profiles, connections, projects, hackathons, and messaging are available in the deployed application.

Development will continue with additional features, UI improvements, and real-time functionality.

---

## Author

**Bhumika Choudhary**

B.Tech Student  
Full-Stack Developer | DSA Enthusiast

---

## Feedback

Feedback and suggestions are welcome.

If you find the project useful or interesting, consider giving the repository a star.