# Quick Setup Guide 🚀

Follow these steps to get your LinkedIn Clone running:

## Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if available, or create manually)
# Add these lines:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/linkedin-clone
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# NODE_ENV=development

# Start MongoDB (if running locally)
# On Windows: Make sure MongoDB service is running
# On Mac/Linux: sudo mongod

# Start the backend server
npm start
```

**Backend should be running on:** `http://localhost:5000`

## Step 2: Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Frontend should open automatically on:** `http://localhost:3000`

## Step 3: Test the Application

1. Open your browser to `http://localhost:3000`
2. You should see the Auth page
3. Click "Sign Up" to create a new account
4. Fill in Name, Email, and Password (min 6 characters)
5. After signing up, you'll be redirected to the Feed page
6. Try creating a post!
7. Navigate to Profile to see your posts and edit/delete them

## Troubleshooting

### If MongoDB connection fails:
- Make sure MongoDB is installed and running
- Check the `MONGODB_URI` in your `.env` file
- For MongoDB Atlas: Replace `MONGODB_URI` with your Atlas connection string

### If backend fails to start:
- Check if port 5000 is available
- Verify all dependencies are installed (`npm install`)
- Check `.env` file exists and has correct values

### If frontend fails to start:
- Make sure you're in the `frontend` directory
- Run `npm install` again if needed
- Check if port 3000 is available

## Environment Variables

**Backend `.env` file should contain:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkedin-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

## Default API URL

The frontend is configured to connect to `http://localhost:5000/api` by default. If you change the backend port, update:
- `frontend/src/utils/api.js` - Change `API_URL` constant

---

**That's it! Your LinkedIn Clone should now be running! 🎉**
