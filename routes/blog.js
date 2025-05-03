const express = require("express");
const Blog = require("../models/Blog");
const router = express.Router();
const userProfileDate = require("../models/userProfile");
const crypto = require("crypto");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");
const session = require("express-session");

const multer = require("multer");
const path = require("path");


const csrfProtection = csrf({ cookie: true });
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests, please try again later",
});







const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
router.use(
  session({
    secret: "your-secret-key", // Choose a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // secure cookies only in production
      maxAge: 3600000, // 1 minute expiration time for the session cookie (adjust as needed)
    },
  })
);
// Get all blogs
router.get("/blogs", async (req, res) => {
  try {
      const user = req.session.user;
      const profile = await userProfileDate.findOne({
        userId: req.session.user.id,
      });
    const title = "blogs"
    const blogs = await Blog.find();
    res.render("pages/blogs", { blogs, title, user, profile });
  } catch (err) {
    res.status(500).send("Error fetching blogs");
  }
});

// Get single blog post
router.get("/blog/:id", csrfProtection, limiter, async (req, res) => {
  try {
    const user = req.session.user;

    // 1. Authentication Check
    if (!user?.id) {
      req.flash("error", "Please log in to view this blog.");
      return res.redirect("/login");
    }

    // 2. Session Security (Updated Fix)
    if (!req.session.sessionHash) {
      req.session.sessionHash = crypto
        .createHash("sha256")
        .update(req.sessionID)
        .digest("hex");
    }

    // 3. Get User Profile and Blog Data
    const [profile, blog] = await Promise.all([
      userProfileDate.findOne({ userId: user.id }),
      Blog.findById(req.params.id)
        .populate("author", "firstName lastName profileImage")
        .populate("likes")
        .populate("comments.user", "firstName lastName profileImage")
        .populate("comments.replies.user", "firstName lastName profileImage")
      // optional: if you want author name
    ]);

// Fetch the logged-in user's profile
const blogUser = await Blog.find()
  .sort({ date: -1 })
  .populate("author", "firstName lastName profileImage")
  .populate("likes")
  .populate("comments.user", "firstName lastName profileImage")
      .populate("comments.replies.user", "firstName lastName profileImage")
    
    // console.log(blogUser)
    if (!blog.likes) {
      blog.likes = []
    }
    if (!blog) {
      return res.status(404).send("Blog not found.");
    }

    // 4. View Counting Logic (Optimized)
    req.session.viewedBlogs = req.session.viewedBlogs || [];

    const isNewView =
      !req.session.viewedBlogs.includes(blog._id.toString()) &&
      !blog.viewedBy.includes(user.id);

    if (isNewView) {
      blog.views += 1;
      blog.viewedBy.push(user.id);
      req.session.viewedBlogs.push(blog._id.toString());
      await blog.save();
    }

    // 5. Render Page
    res.render("pages/blog", {
      blog: blog,
      title: "blogs",
      user,
      profile,
      blogs: blogUser,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error("Error in /blog/:id:", err);
    res.status(500).send("Error loading blog");
  }
});
router.post("/blog/:id/comment", csrfProtection, limiter, async (req, res) => {
  try {
    const user = req.session.user;

    // 🔐 Check if user is logged in
    if (!user) {
      return res.redirect("/login");
    }

    // 📋 Find the user profile by session user ID
    const profile = await userProfileDate.findOne({ userId: user.id });
    if (!profile) {
      return res.status(403).send("User profile not found.");
    }

    // 🔍 Find the blog by ID (no populate yet)
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // 📝 Push new comment with user = profile._id
    blog.comments.push({
      user: profile.id,
      text: req.body.text,
      createdAt: new Date(),
    });

    // 💾 Save updated blog
    await blog.save();

    // ✅ Optional: Flash message (if using connect-flash)
    // req.flash("success", "Comment added successfully!");

    // console.log(req.params.id)// 🔁 Redirect to the blog detail page
    res.redirect("/blog/" + req.params.id);
    
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).send("Error adding comment");
  }
});
// Example route for paginated comments
router.get("/blog/:id/comment", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = 10;
    const blogId = req.params.id;

    const comments = await Blog.find({ blog: blogId })
      .populate("user", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1); // Get one extra to check if there's more

    const hasMore = comments.length > limit;
    const results = hasMore ? comments.slice(0, -1) : comments;

    res.render({
      comments: results,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load comments" });
  }
});

// GET route: Show reply form
router.get("/blog/:blogId/comment/:commentId/reply", async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const user = req.session.user;

    if (!user) {
      return res.redirect("/login");
    }

    const profile = await userProfileDate.findOne({ userId: user.id });

    const blog = await Blog.findById(blogId)
      .populate("comments.replies.user"); // Populate replies' user

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    res.render("pages/replyForm", {
      title: "Reply to Comment",
      blog,
      comment,
      user,
      profile,
      layout: "layout/main",
    });
  } catch (err) {
    console.error("Error loading reply form:", err);
    res.redirect("/");
  }
});

// POST route: Submit reply
router.post("/blog/:blogId/comment/:commentId/reply", async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const { text } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.redirect("/login");
    }

    const profile = await userProfileDate.findOne({ userId: user.id });

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    // Push reply
    comment.replies.push({
      user: profile._id,  // Always use _id, not full user object
      text: text,
      createdAt: new Date(),
    });

    await blog.save();

    res.redirect("/blog/" + blogId);
  } catch (err) {
    console.error("Error posting reply:", err);
    res.status(500).send("Error posting reply");
  }
});
// In your routes file (routes/blog.js)
// Updated like route
router.post("/blog/:id/like", async (req, res) => {
  try {
    const user = req.session.user;
    
    // Check if user is logged in
    if (!user?.id) {
      req.flash("error", "Please login to like posts");
      return res.redirect("/login");
    }

    const blog = await Blog.findById(req.params.id);
    const profile = await userProfileDate.findOne({ userId: user.id });

    if (!blog) {
      return res.redirect("/error"); // Handle blog not found
    }

    // Check if the user has already liked the post
    const hasLiked = blog.likes.some(like => like.equals(profile._id));

    if (hasLiked) {
      // If the user has liked, remove the like
      blog.likes.pull(profile._id);
    } else {
      // If not, add the like
      blog.likes.push(profile._id);
    }

    await blog.save();
    console.log("Liked:", hasLiked, "Total Likes:", blog.likes.length);
    // Redirect back to the blog page
     res.status(200).json({ likes: blog.likes.length, liked: !hasLiked });
  } catch (error) {
    console.error("Error in like route:", error);
    req.flash("error", "Error processing your like");
    res.redirect("/blogs");
  }
});







// Add new blog (admin route)
router.get("/addblog", async (req, res) => {
const user = req.session.user;
const profile = await userProfileDate.findOne()
const title = "add-blog"
  res.render("pages/addBlog", {
    title,
    layout: "layout/main",
    profile,
    user
  });
});

router.post("/addblog", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : "";
const profile = await userProfileDate.findOne({ userId: req.session.user.id });
    const newBlog = new Blog({
      title, // same as: title: title
      author: profile.id, // same as: author: author
      content, // this must come from the Toast UI .getHTML()
      image, // this must be from req.file, not req.body.image
    });

    await newBlog.save();
    res.redirect("/blogs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving blog");
  }
});

// Route to show edit form
// Show edit form
router.get("/blog/:id/edit", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.render("pages/editBlog", {
      title: "Edit Blog",
      blog,
      layout: "layout/main",
    });
  } catch (err) {
    console.error("Error loading blog for editing:", err);
    res.redirect("/");
  }
});

// Update blog (with optional image upload)
router.post("/blog/:id/update", upload.single("image"), async (req, res) => {
  try {
    const { title, author, content } = req.body;
    const updatedData = {
      title,
      author,
      content,
      date: Date.now(),
    };

    if (req.file) {
      updatedData.image = "/uploads/" + req.file.filename;
    }

    await Blog.findByIdAndUpdate(req.params.id, updatedData);
    res.redirect("/blog/" + req.params.id);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.redirect("/");
  }
});

// Delete blog
router.post("/blog/:id/delete", async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blogs");
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.redirect("/");
  }
});

// Show single blog post
router.get("/blog/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const user = req.session.user;
    const profile = await userProfileDate.findOne({
      userId: req.session.user.id,
    });

    res.render("pages/showBlog", {
      title: blog.title,
      blog,
      user,
      profile,
      layout: "layout/main",
    });
  } catch (err) {
    console.error("Blog not found:", err);
    res.redirect("/");
  }
});

router.get("/admindashboard", async (req, res) => {
  try {
    const user = req.session.user;

    // Fetch profile if needed in the view
    // Fetch all blogs (either globally or by user)
    const blogs = await Blog.find(); // or { userId: user.id } if filtering by user

    res.render("pages/allblogs", {
      title: "All Blogs",
      blogs,
      layout: "layout/main",
      user,
      
    });
  } catch (err) {
    console.error("Error fetching blogs", err);
    res.redirect("/");
  }
});

module.exports = router;
