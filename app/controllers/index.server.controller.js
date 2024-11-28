import db from "../model/db.js";
import bcrypt from "bcrypt";

const renderLogin = (req, res) => {
  res.render("index", { title: "Login" });
};

const handleLogin = async (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect("/feedback");
  }
  const client = await userExists(req.body.email, req.body.password);
  if (client) {
    req.session.loggedIn = true;
    req.session.client = client;
    return res.redirect("/feedback");
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
    console.log("password matched")
    return client;
  }
  console.log("password did not match")
  return null;
};

const renderSignUp = (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect("/feedback");
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
  };

  try {
    await db.insertClient(client); // No need for a callback
    res.redirect("/"); // Redirect after successful insertion
  } catch (err) {
    if (err.message === "Email already exists") {
      res.render("signup",{ title: "Sign UP" , errorMessage: "Error: Email already exists. Please use a different email."});
    } 
    console.error("Error inserting client data:", err);
    res.status(500).send("Error inserting client data");
  }

}




const renderFeedback = (req, res) => {
  // checks if a user has logged in. redirect to login page if not logged in
  if (!req.session.loggedIn) {
    return res.redirect("/");
  }

  res.render("feedback", {
    title: "Feedback",
    client: req.session.client,
  });
};

const submitFeedback = async (req, res) => {
  //saving form values

  await db.addFeedback(req.session.client.email, req.body.feedback);
  req.session.client = await db.fetchClient(req.session.client.email);
  res.redirect("/thankyou");
};

const renderThankYou = (req, res) => {
  //checks if user has filled the form. if not, redirect to feedback
  if (!req.session.client.feedback) {
    return res.redirect("/feedback");
  }
  res.render("thankyou", {
    title: "Thank You",
    firstName: req.session.client.firstName,
    lastName: req.session.client.lastName,
    feedback: req.session.client.feedback,
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
};
export default controller;
