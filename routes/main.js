const express = require("express");
const routes = express.Router();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const session = require("express-session");
const RateLimiter = require("express-rate-limit");
const multer = require("multer");
const Blog = require('../models/Blog')
const { check, validationResult } = require("express-validator");
const path = require("path");
const csrf = require("csurf")

const User = require("../models/user");
const userProfileDate = require("../models/userProfile");
const categoryData = require("../models/userCategory");
const { Router } = require("express");



const urlencodedParser = bodyParser.urlencoded({ extended: false });


// Rate limiters
const rateLimitSettings = {
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many attempts. Please try again later after 15 minutes ",
  keyGenerator: (req) => req.ip,
};

const LoginAuthLimiter = RateLimiter({
  ...rateLimitSettings,
  handler: (req, res) => {
    req.flash("error", rateLimitSettings.message);
    res.redirect("/login");
  },
});
const csrfProtection = csrf({ cookie: true });
routes.use(cookieParser())
const RegisterAuthLimiter = RateLimiter({
  ...rateLimitSettings,
  handler: (req, res) => {
    req.flash("error", rateLimitSettings.message);
    res.redirect("/register");
  },
});

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  req.flash("error", "Please login first");
  res.redirect("/login");
};

// Home route
routes.get("/", isAuthenticated, async (req, res) => {
  try {
    // Populate the 'author' field to get complete author details
    const blogs = await Blog.find().sort({ date: -1 }).populate("author");

    // Fetch the logged-in user's profile
    const currentUserId = req.session?.user?.id;
    const currentUserProfile = currentUserId
      ? await userProfileDate.findOne({ userId: currentUserId })
      : null;

    res.render("index", {
      user: req.session.user, // Pass the logged-in user
      title: "Dashboard",
      layout: "layout/main",
      profile: currentUserProfile, // Logged-in user's profile
      blogs: blogs, // Blogs with populated author details
    });
  } catch (error) {
    console.log("Error in index route:", error);
    res.status(500).send("Server error");
  }
});








// Dashboard
routes.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("Dashboard", { title: "Dashboard" });
});

// GET Register
routes.get("/register", (req, res) => {
  res.render("pages/register", {
    title: "Register",
    layout: "layout/main"
  });
});

// POST Register
routes.post(
  "/register",
  RegisterAuthLimiter,
  urlencodedParser,
  [
    check("username", "Username must be at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .escape(),
    check("email", "Email is not valid").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters")
      .isLength({ min: 6 })
      .matches(/\d/)
      .withMessage("Must include a number")
      .matches(/[A-Z]/)
      .withMessage("Must include an uppercase letter")
      .matches(/[!@#$%^&*(),.?\":{}|<>]/)
      .withMessage("Must include a special character"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors
        .array()
        .map((e) => e.msg)
        .join(", ");
      req.flash("error", alert);
      return res.redirect("/register");
    }

    const { username, email, password } = req.body;

    try {
      if (await User.findOne({ username })) {
        req.flash("error", "Username already exists");
        return res.redirect("/register");
      }

      if (await User.findOne({ email })) {
        req.flash("error", "Email already exists");
        return res.redirect("/register");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await new User({ username, email, password: hashedPassword }).save();

      res.redirect("/login");
    } catch (error) {
      req.flash("error", "Something went wrong.");
      res.redirect("/register");
    }
  }
);

// GET Login
routes.get("/login",csrfProtection,async (req, res) => {
    
  // console.log("Generated CSRF Token:", req.csrfToken());
  res.render("pages/login", {
    title: "Login",
    layout: "layout/main",
    alert: [],
    csrfToken: req.csrfToken(),
  });
});

// POST Login
routes.post("/login",csrfProtection, LoginAuthLimiter, async (req, res) => {
  //  console.log("Received CSRF Token:", req.body._csrf);
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    req.flash("error", "Invalid credentials");
    return res.redirect("/login");
  }

  req.session.user = {
    id: user._id,
    username: user.username,
    email: user.email,
  };

  const userProfile = await userProfileDate.findOne({ userId: user._id });
  const categoryProfile = await categoryData.findOne({ userId: user._id });

  // Check if profile is completed
  if (!userProfile) {
    req.flash("info", "Complete your profile");
    return res.redirect("/nextPageProfile");
  }

  // Check if categories are selected
  if (!categoryProfile || !categoryProfile.selectedCategories?.length) {
    req.flash("info", "Please select your categories");
    return res.redirect("/categorySelection");
  }

  // Both are completed, redirect to dashboard
  req.flash("success", "Successfully Logged In");
  return res.redirect("/"); // Dashboard


  
});

// GET Logout
routes.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// GET Profile setup
routes.get("/nextPageProfile", isAuthenticated, (req, res) => {
  res.render("pages/nextPageProfile", {
    title: "Edit Profile",
    layout: "layout/main",
  });
});

// POST Profile setup
// POST Profile setup
routes.post(
  "/nextPageProfile",
  isAuthenticated,
  upload.single("profileImage"),
  async (req, res) => {
    // console.log("Session User:", req.session.user);

    try {
      const profileData = {
        userId: req.session.user.id, // ✅ Add userId to match schema
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dob: req.body.dob,
        profileImage: req.file
          ? "/uploads/" + req.file.filename
          : "/uploads/default-profile.jpg", // fallback
      };

      await userProfileDate.findOneAndUpdate(
        { userId: req.session.user.id },
        {
          userId: req.session.user.id, // ✅ this line is missing
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          dob: req.body.dob,
          profileImage: req.file ? "/uploads/" + req.file.filename : null,
        },
        { upsert: true, new: true } // ✅ ensures it inserts if not found
      );


      res.redirect("/categorySelection");
    } catch (err) {
      console.error("Error saving profile:", err);
      req.flash("error", "There was an issue saving your profile.");
      res.redirect("/nextPageProfile");
    }
  }
);
// GET Category Selection
routes.get("/categorySelection", isAuthenticated, async (req, res) => {
  const categories = [
    "Technology",
    "Science",
    "Math",
    "Art",
    "History",
    "Sports",
    "Artificial Intelliagence",
    "programming",
  ];
  const categoryProfile = await categoryData.findOne({
    userId: req.session.user._id,
  });

  res.render("pages/categorySelection", {
    title: "Category Selection",
    categories,
    selectedCategories: categoryProfile?.selectedCategories || [],
    layout: "layout/main",
  });
});

// POST Save Categories
routes.post(
  "/saveCategories",
  urlencodedParser,
  isAuthenticated,
  async (req, res) => {
    // console.log("Session User:", req.session.user);

    const selected = Array.isArray(req.body.selectedCategories)
      ? req.body.selectedCategories
      : [req.body.selectedCategories];

    if (!selected.length || selected[0] === "") {
      req.flash("error", "Please select at least one category.");
      return res.redirect("/categorySelection");
    }

    try {
      await categoryData.findOneAndUpdate(
        { userId: req.session.user.id },
        {
          userId: req.session.user.id, // ✅ again, ensure userId is stored
          selectedCategories: selected,
        },
        { upsert: true, new: true } // ✅ creates entry if not present
      );

      req.flash("success", "Categories saved!");
      res.redirect("/");
    } catch (error) {
      console.error("Error saving categories:", error);
      req.flash("error", "Failed to save categories.");
      res.redirect("/categorySelection");
    }
  }
);

routes.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const UserId = req.session.user.id
    // console.log(UserId);
        const profile = await userProfileDate.findOne({
          userId: UserId,
        });
    // console.log("Fetched profile:", profile); 
    // Fetch only blogs that belong to the logged-in user


    if (!profile) {
      req.flash("error", "Please complete your profile first.");
      return res.redirect("/nextPageProfile");
    }
    const blogs = await Blog.find({ author: profile._id }).sort({ date: -1 });
    // console.log(blogs)
    // Render the profile page with the fetched profile and blogs
    res.render("pages/profile", {
      title: "Your Profile",
      profile,
      user: req.session.user,
      blogs, // Only the blogs created by the logged-in user
      layout: "layout/main",
    });
  } catch (err) {
    console.error("Error loading profile:", err);
    req.flash("error", "Failed to load profile.");
    res.redirect("/");
  }
});


routes.get('/contact', (req, res) => {
  res.render("pages/contact", {
    title: "muzamil Riaz",
    layout: "layout/main",
  });
})


routes.get("/search", async (req, res) => {
  try {
    // console.log("Search hit at", new Date().toISOString(), req.query);

    const title = "search";
    const { searchTerm, type, date, sort } = req.query;

    let searchNoSpecialChar = searchTerm
      ? searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
      : "";

    let query = {
      $or: [
        { title: { $regex: searchNoSpecialChar, $options: "i" } },
        { content: { $regex: searchNoSpecialChar, $options: "i" } },
      ],
    };

    if (type) {
      query.type = type;
    }

    if (date) {
      const now = new Date();
      let dateFilter;
      switch (date) {
        case "24h":
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      if (dateFilter) {
        query.date = { $gte: dateFilter };
      }
    }

    // Set default sort option (e.g., by date descending)
    let sortOption = { date: -1 }; // Default to newest first
    if (sort) {
      switch (sort) {
        case "newest":
          sortOption = { date: -1 };
          break;
        case "oldest":
          sortOption = { date: 1 };
          break;
        case "views":
          sortOption = { views: -1 };
          break;
      }
    }

    // console.log("Session user ID:", req.session.user.id);

    const blog = await Blog.find(query).sort(sortOption);
    const categoryProfile = await categoryData.findOne({
      userId: req.session.user.id,
    });

    res.render("search", {
      title,
      blog,
      layout: "layout/main",
      categoryProfile,
      searchTerm,
      type,
      date,
      sort, // Make sure the 'sort' value is passed for UI purposes
    });
  } catch (error) {
    console.log("Error in search:", error);
    res.status(500).send("Search failed");
  }
});

routes.get('/about',async (req, res) => {
  const user = req.session.user.id;
  const profile = await userProfileDate.findOne({
    userId: user,
  });
  const title = "about"
  const name = "Muzammil Riaz"
  res.render("pages/about", {
    title,
    layout: "layout/main",
    name,
    user,
    profile
  });
})

module.exports = routes;
