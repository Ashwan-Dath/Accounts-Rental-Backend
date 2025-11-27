# Account Rental Backend

A Node.js and Express-based backend API for an account rental service with user authentication and authorization.

## Features

- User registration with validation
- User login with JWT authentication
- Password hashing with bcryptjs
- MongoDB database integration
- Protected routes with middleware
- User profile management
- CORS enabled

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Ensure MongoDB is running on your system:
```bash
# On Linux/Mac
mongod

# Or if using MongoDB as a service
# It should be running automatically
```

4. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/account-rental
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="Account Rental <no-reply@example.com>"
OTP_EXPIRY_MINUTES=10
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **Response:** User object and JWT token

#### 2. Login User
- **POST** `/api/auth/login` *(also available at `/users/login` for clients expecting the old path)*
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** User object and JWT token

#### 3. Get Current User (Protected)
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user object

#### 4. Logout (Protected)
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Success message

- ### User Routes (`/users`)
  - **POST** `/users/login` — Thin wrapper around the auth login controller; future user-facing endpoints should be added to `src/routes/userRoutes.js` so every `/users/*` request funnels through that router.

### Admin Routes (`/admin`)

#### 1. Register Admin (sends OTP email)
- **POST** `/admin/register`
- **Body:**
```json
{
  "fullName": "Admin User",
  "email": "admin@example.com",
  "password": "supersecret"
}
```
- **Response:** Admin object (password/OTP omitted). A 4-digit OTP is generated, stored with a 10-minute expiry, and emailed via Nodemailer. The admin record is only saved after the email sends successfully. This route is currently public; lock it down before production use.

#### 2. Verify Admin OTP
- **POST** `/admin/verifyOtp`
- **Body:**
```json
{
  "email": "admin@example.com",
  "otp": "1234"
}
```
- **Response:** JWT token and admin object. OTP must match and not be expired; on success the admin is marked verified and OTP fields are cleared.

#### 3. Resend Admin OTP
- **POST** `/admin/resendOtp`
- **Body:**
```json
{
  "email": "admin@example.com"
}
```
- **Response:** Success message after a fresh 4-digit OTP is generated, stored with a new expiry, and emailed. Returns `Please enter correct email` when no admin record matches.

## User Model Schema

```
{
  firstName: String (required, min 2 chars),
  lastName: String (required, min 2 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  phone: String (optional),
  address: String (optional),
  city: String (optional),
  state: String (optional),
  zipCode: String (optional),
  role: String (enum: 'user', 'admin', default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Project Structure

```
AccountsBackend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js   # Admin logic
│   │   └── authController.js    # Auth logic
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/
│   │   ├── Admin.js             # Admin schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── adminRoutes.js       # Admin routes
│   │   └── userRoutes.js        # User-facing /users/* routes
│   └── server.js                # Main server file
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Future Enhancements

- Add email verification
- Add password reset functionality
- Add user profile update endpoint
- Add user deletion endpoint
- Add admin panel functionality
- Add rate limiting
- Add request validation middleware
- Add logging system
- Add testing suite

## License

ISC

## Author

Your Name
