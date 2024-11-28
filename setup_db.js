//run  this file to create sample users in the database

import db from './app/model/db.js';

async function setupDatabase() {
  const sampleClient = {
    email: "haleemah@gmail.com",
    password: "password123",
    firstName: "Haleemah",
    lastName: "Anwary",
    city: "Toronto",
    postalCode: "10001",
    role: "client", 
  };

  const sampleAdmin = {
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
  };

  try {
    await db.insertClient(sampleClient);
    console.log("Sample client inserted successfully");

    await db.insertClient(sampleAdmin);
    console.log("Sample admin inserted successfully");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    process.exit();
  }
}

setupDatabase();