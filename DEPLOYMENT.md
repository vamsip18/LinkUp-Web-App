# Deployment Guide: Backend (Render) + Frontend (Vercel)

This guide provides step-by-step instructions to deploy your LinkUp Web App backend to Render and frontend to Vercel.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
4. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

---

## 🗄️ Part 1: Setup MongoDB Atlas (Database)

### Step 1.1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login and create a new organization (if first time)
3. Click **"Build a Database"**
4. Choose **FREE** tier (M0)
5. Select a cloud provider and region (choose closest to your users)
6. Click **"Create"**
7. Wait for cluster to be created (2-3 minutes)

### Step 1.2: Configure Database Access
1. In MongoDB Atlas, go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and generate a secure password (SAVE THIS PASSWORD!)
5. Set user privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 1.3: Configure Network Access
1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for production)
   - Or add specific IPs: `0.0.0.0/0` to allow all IPs
4. Click **"Confirm"**

### Step 1.4: Get Connection String
1. Go to **Database** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
4. Replace `<password>` with your database user password
5. **SAVE THIS CONNECTION STRING** - You'll need it for Render

---

## 🚀 Part 2: Deploy Backend to Render

### Step 2.1: Prepare Backend for Deployment

1. **Create `.env.example` file in backend folder** (optional, for reference):
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

2. **Ensure your code is pushed to GitHub** with the backend folder structure

### Step 2.2: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository
5. Configure the service:
   - **Name**: `linkup-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: `backend` (IMPORTANT: Set this to your backend folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2.3: Add Environment Variables in Render

In the Render dashboard, go to your service → **Environment** tab, add these:

```
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=generate_a_random_secret_key_here
PORT=5000
```

**Generate JWT_SECRET:**
- You can use: `openssl rand -base64 32` (in terminal)
- Or use an online generator

### Step 2.4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build your application
   - Deploy it
3. Wait for deployment to complete (5-10 minutes)
4. Your backend URL will be: `https://your-service-name.onrender.com`

### Step 2.5: Verify Backend Deployment

1. Visit: `https://your-service-name.onrender.com/`
2. You should see: `{"message":"LinkedIn Clone API is running"}`
3. **Note down your backend URL** - You'll need it for frontend deployment

---

## 🌐 Part 3: Deploy Frontend to Vercel

### Step 3.1: Prepare Frontend for Deployment

1. **Create `.env.example` file in frontend folder** (optional):
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

### Step 3.2: Deploy to Vercel via GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Create React App` (or `Vite` if using Vite)
   - **Root Directory**: `frontend` (IMPORTANT: Set this!)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `build` (should auto-detect)

### Step 3.3: Add Environment Variables in Vercel

Before deploying, click **"Environment Variables"** and add:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

**Important:** Replace `your-backend-url` with your actual Render backend URL (without `/api` at the end, we add that in the variable)

### Step 3.4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (3-5 minutes)
3. Your frontend will be deployed at: `https://your-project-name.vercel.app`

---

## ✅ Part 4: Update URLs After Deployment

### Step 4.1: Update Frontend Environment Variable

If your backend URL changes or you need to update it:

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Update `REACT_APP_API_URL` with your new backend URL
4. Click **"Save"**
5. Go to **Deployments** tab
6. Click the three dots (...) on latest deployment → **"Redeploy"**

### Step 4.2: Update Backend CORS (if needed)

If your frontend URL changes, update CORS in `backend/app.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

Then redeploy on Render.

### Step 4.3: Files That Reference API URLs

After deployment, these files already use `process.env.REACT_APP_API_URL`, so no code changes needed:
- ✅ `frontend/src/utils/api.js` - Uses env variable
- ✅ `frontend/src/pages/FeedPage.jsx` - Uses env variable  
- ✅ `frontend/src/pages/ProfilePage.jsx` - Uses env variable
- ✅ `frontend/src/components/PostCard.jsx` - Uses env variable

**No code changes required!** Just update the environment variable in Vercel.

---

## 🔧 Part 5: Additional Configuration

### Step 5.1: Update CORS in Backend (Recommended)

Update `backend/app.js` to allow your Vercel frontend:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Add to Render environment variables:
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 5.2: File Upload Storage (Important!)

**Current Setup:** Files are stored in `backend/uploads/` folder
- **Render:** This works but files are lost on redeploy
- **Better Solution:** Use cloud storage (AWS S3, Cloudinary, etc.)

For now, Render's filesystem will work, but consider migrating to cloud storage for production.

### Step 5.3: Database Connection String Format

Your MongoDB connection string should be:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

Replace:
- `username` - Your MongoDB username
- `password` - Your MongoDB password (URL encode if special characters)
- `database_name` - Your database name (e.g., `linkup`)

---

## 🐛 Troubleshooting

### Backend Issues:

1. **Build Fails:**
   - Check Root Directory is set to `backend`
   - Check Node version compatibility
   - Check `package.json` scripts

2. **Database Connection Fails:**
   - Verify MongoDB connection string
   - Check Network Access in MongoDB Atlas
   - Ensure password is URL-encoded (replace special chars with %XX)

3. **Environment Variables Not Working:**
   - Ensure variable names match exactly
   - Restart service after adding variables

### Frontend Issues:

1. **Can't Connect to Backend:**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check CORS settings in backend
   - Ensure backend URL doesn't have `/api` in the env variable (add it in code)

2. **Build Fails:**
   - Check Root Directory is set to `frontend`
   - Ensure all dependencies are in `package.json`

3. **Images Not Loading:**
   - Verify backend URL is correct
   - Check if backend is serving `/uploads` route correctly

---

## 📝 Summary Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB user and network access configured
- [ ] Backend deployed to Render
- [ ] Environment variables set in Render (MONGO_URI, JWT_SECRET, PORT)
- [ ] Backend URL obtained from Render
- [ ] Frontend deployed to Vercel
- [ ] `REACT_APP_API_URL` set in Vercel with backend URL
- [ ] CORS updated in backend (optional but recommended)
- [ ] Tested login/signup functionality
- [ ] Tested creating posts
- [ ] Tested image uploads

---

## 🔗 Your URLs After Deployment

- **Backend API:** `https://your-backend-name.onrender.com/api`
- **Frontend:** `https://your-project-name.vercel.app`

Update frontend environment variable with backend URL when deploying!

---

## 💡 Pro Tips

1. **Auto-Deploy:** Both Render and Vercel auto-deploy on git push (if enabled)
2. **Environment Variables:** Use different values for production vs preview deployments
3. **Monitoring:** Check Render and Vercel logs if something breaks
4. **Backup:** Keep your MongoDB connection string and JWT secret safe
5. **Domain:** You can add custom domains in both platforms

---

Need Help? Check logs in:
- **Render:** Service → Logs tab
- **Vercel:** Deployment → View Function Logs

