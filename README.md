# LinkedIn Clone - LinkUp 🚀

A full-stack social media application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This is a LinkedIn-inspired clone with modern UI, animations, and responsive design.

## ✨ Features

- 🔐 **User Authentication** - Sign up and login with JWT authentication
- 📝 **Create Posts** - Share your thoughts with the community
- 📰 **Feed Page** - View all posts from all users in chronological order
- 👤 **Profile Page** - View your profile and manage your posts
- ✏️ **Edit/Delete Posts** - Edit or delete your own posts (with confirmation)
- 🎨 **Modern UI** - Beautiful gradient designs with animations
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Smooth Animations** - Powered by Framer Motion

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)

### Frontend
- React.js (JSX only)
- React Router DOM
- Tailwind CSS
- Framer Motion (Animations)
- Axios (HTTP Client)
- React Hot Toast (Notifications)
- Lucide React (Icons)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Socialmedia clone Project"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkedin-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Note:** Make sure MongoDB is running on your system. If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Run the Application

#### Start the Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

#### Start the Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Socialmedia clone Project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── app.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── PostCard.jsx
    │   │   └── CreatePost.jsx
    │   ├── pages/
    │   │   ├── AuthPage.jsx
    │   │   ├── FeedPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── auth.js
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts (Protected)
- `POST /api/posts` - Create a new post (Protected)
- `GET /api/posts/user` - Get user's posts (Protected)
- `PUT /api/posts/:id` - Update a post (Protected)
- `DELETE /api/posts/:id` - Delete a post (Protected)

## 🎨 Design Features

- **Color Palette**: Blue & Gray tones (#2563EB, #1E3A8A, #F3F4F6, #111827)
- **Typography**: Poppins, Inter, Roboto fonts
- **Animations**: Fade-in, slide, scale effects using Framer Motion
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Rounded corners with shadow and hover lift effects

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Secure password validation (minimum 6 characters)

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check your `.env` file has the correct `MONGODB_URI`
- If using MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the port in `backend/.env` file
- Update the frontend API URL in `frontend/src/utils/api.js`

### CORS Issues
- CORS is enabled in the backend. Make sure the frontend URL matches.

## 📝 Notes

- The `.env` file in the backend is not included in the repository for security reasons. Create it manually.
- Make sure to use a strong `JWT_SECRET` in production.
- All passwords are hashed before storing in the database.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using MERN Stack**
