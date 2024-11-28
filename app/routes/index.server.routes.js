import controller from "../controllers/index.server.controller.js";

export default (app) => {
  app.get("/", controller.renderLogin);
  app.get("/signup", controller.renderSignUp);
  app.post("/signup", controller.handleSignUp);
  app.post("/login", controller.handleLogin);
  app.get("/feedback", controller.renderFeedback);
  app.post("/submit-feedback", controller.submitFeedback);
  app.get("/thankyou", controller.renderThankYou);
  app.get("/logout", controller.handleLogout);
  app.get("/dashboard", controller.renderDashboard);
  app.get("/get-feedback", controller.fetchFeedback);
};
