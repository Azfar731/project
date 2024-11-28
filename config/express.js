import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url"; // Required to replace __dirname

// Convert __dirname to work with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function createApp() {
  const app = express();

  // Middleware setup
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    session({
      secret: "mySecret",
      resave: false,
      saveUninitialized: true,
    })
  );

  // View engine setup
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../app/views"));

  // Static files setup
  app.use(express.static(path.join(__dirname, "../public")));

  // Dynamically import and set up routes
  const routes = await import("../app/routes/index.server.routes.js");
  routes.default(app);

  return app;
}
