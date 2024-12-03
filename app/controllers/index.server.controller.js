import db from "../model/db.js";
import bcrypt from "bcrypt";

const renderLogin = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "client") {
      return res.redirect("/feedback");
    } else if (req.session.user.role === "admin") {
      return res.redirect("/dashboard");
    }
  }
  res.render("index", { title: "Login" });
};

const handleLogin = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/feedback");
  }
  const user = await userExists(req.body.email, req.body.password);
  if (user) {
    req.session.user = true;

    if (user.role === "client") {
      req.session.user = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        postalCode: user.postalCode,
        feedback: user.feedback,
        role: user.role,
      };
      return res.redirect("/feedback");
    } else if (user.role === "admin") {
      req.session.user = {
        email: user.email,
        role: user.role,
      };
      return res.redirect("/dashboard");
    }
  } else {
    res.render("index", {
      title: "Login",
      errorMessage: "Wrong email or password",
    });
  }
};

const userExists = async (email, password) => {
  const client = await db.fetchClient(email);
  if (!client) {
    console.log("No client found with email:", email);
    return null;
  }
  const isMatch = await bcrypt.compare(password, client.password);
  if (isMatch) {
    console.log("password matched");
    return client;
  }
  console.log("password did not match");
  return null;
};

const renderSignUp = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "client") {
      return res.redirect("/feedback");
    } else if (req.session.user.role === "admin") {
      return res.redirect("/dashboard");
    }
  }

  res.render("signup", { title: "Sign Up" });
};

async function handleSignUp(req, res) {
  const { firstName, lastName, email, password, city, postalCode } = req.body;

  const client = {
    firstName,
    lastName,
    email,
    password,
    city,
    postalCode,
    role: "client",
  };

  try {
    await db.insertClient(client); // No need for a callback
    res.redirect("/"); // Redirect after successful insertion
  } catch (err) {
    if (err.message === "Email already exists") {
      res.render("signup", {
        title: "Sign UP",
        errorMessage:
          "Error: Email already exists. Please use a different email.",
      });
    }
    console.error("Error inserting client data:", err);
  }
}

const renderFeedback = (req, res) => {
  // checks if a user has logged in. redirect to login page if not logged in
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("feedback", {
    title: "Feedback",
    user: req.session.user,
  });
};

const submitFeedback = async (req, res) => {
  //saving form values

  await db.addFeedback(req.session.user.email, req.body.feedback);
  req.session.user = await db.fetchClient(req.session.user.email);
  res.redirect("/thankyou");
};

const renderThankYou = (req, res) => {
  //checks if user has filled the form. if not, redirect to feedback
  if (!req.session.user || !req.session.user.feedback) {
    return res.redirect("/feedback");
  }
  res.render("thankyou", {
    title: "Thank You",
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    feedback: req.session.user.feedback,
  });
};

//create a dashboard for admin
const renderDashboard = (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/");
  }
  res.render("dashboard", { title: "Dashboard" });
};

const fetchFeedback = async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/");
  }
  const email = req.query.email;
  console.log("email provided", email);
  const client = await db.fetchClient(req.query.email);
  if (client !== null) {
    console.log(
      "client found",
      client.firstName,
      client.lastName,
      client.feedback
    );
    res.render("dashboard", {
      title: "Dashboard",
      client: {
        firstName: client.firstName,
        lastName: client.lastName,
        feedback: client.feedback,
        email: client.email,
      },
    });
  } else {
    res.render("dashboard", {
      title: "Dashboard",
      errorMessage: "No client found with this email",
    });
  }
};

//implement handle logout functionality
const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
};

const controller = {
  renderLogin,
  handleLogin,
  renderFeedback,
  submitFeedback,
  renderThankYou,
  handleSignUp,
  renderSignUp,
  renderDashboard,
  fetchFeedback,
  handleLogout,
};
export default controller;
