// Load environment variables from .env file
require("dotenv").config();

// Import dependencies
const express = require("express");
const app = express();
const mainRoute = require("./routes/main");
const ExpressLayout = require("express-ejs-layouts");
const session = require("express-session");
const connectDb = require("./config/db");
const flash = require("connect-flash");
const multer = require("multer");
const RateLimit = require("express-rate-limit");
const Helmet = require("helmet");
const cookieParser = require("cookie-parser");
const blogRoutes = require("./routes/blog");
const MongoStore = require("connect-mongo");
const path = require("path");
const serverless = require("serverless-http");
app.set("trust proxy", 1);
// Connect to MongoDB
connectDb();

// Middleware
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Parse form data

// Pass CSRF token to all views

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use a secure secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // MongoDB connection string
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,

      secure: process.env.NODE_ENV === "production", // Secure cookies in production
    },
  })
);

// Flash messages middleware
app.use(flash());

// Make flash messages available to EJS views
app.use((req, res, next) => {
  res.locals.messages = req.flash("error"); // For error messages
  res.locals.successMessages = req.flash("success"); // For success messages
  next();
});

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
; // Set views folder

// Enable EJS layouts
app.use(ExpressLayout);
app.set("layout", "layout/main"); // Default layout

// Serve static files (CSS, JS, images) from /public folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply Helmet for security
app.use(
  Helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com",
          "https://uicdn.toast.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://stackpath.bootstrapcdn.com",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://uicdn.toast.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com",
        ],
        connectSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://miro.medium.com"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Apply global rate limiter to all routes
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many attempts from this IP, please try again later",
});
app.use(limiter);

// Main router
app.use("", mainRoute);
app.use("/", blogRoutes);

// Start the server
module.exports = app;
module.exports.handler = serverless(app);