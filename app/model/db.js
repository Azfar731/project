import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const url = "mongodb://localhost:27017";
const dbName = "express_project";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let collection;

// Connect once and reuse the connection
async function connect() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected successfully to server");
    }
    const db = client.db(dbName);
    collection = collection || db.collection("clients"); // Reuse the collection
    return collection;
  } catch (err) {
    console.error("Connection error:", err);
    throw err;
  }
}

async function insertClient(clientData) {
  const collection = await connect();
  try {
    // Check if the email already exists
    const existingClient = await collection.findOne({ email: clientData.email });
    if (existingClient) {
      throw new Error("Email already exists");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(clientData.password, 10);
    clientData.password = hashedPassword;

    // Insert the client data into the database
    const result = await collection.insertOne(clientData);
    console.log("Inserted document with ID:", result.insertedId);
  } catch (err) {
    console.error("Error inserting client:", err);
    throw err; // Rethrow the error for higher-level handling
  }
}




async function fetchClients() {
  const collection = await connect();
  try {
    const clients = await collection.find({}).toArray();
    console.log("Fetched documents:", clients.length, "clients found");
    return clients;
  } catch (err) {
    console.error("Error fetching clients:", err);
    throw err; // Rethrow the error
  }
}

// Fetch a single client based on email
async function fetchClient(email) {
  const collection = await connect();
  try {
    const client = await collection.findOne({ email });
    console.log("Fetched document:", client);
    return client;
  } catch (err) {
    console.error("Error fetching client:", err);
    throw err; // Rethrow the error
  }
}

// Add feedback to a client
async function addFeedback(email, feedback) {
  const collection = await connect();
  try {
    const result = await collection.updateOne(
      { email },
      { $set: { feedback } }
    );
    console.log("Updated document:");
  } catch (err) {
    console.error("Error updating feedback:", err);
    throw err; // Rethrow the error
  }
}

// Example data
const newClient = {
  email: "john.doe@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
  city: "New York",
  postalCode: "10001",
};

const admin = {
  email: "admin@gmail.com",
  password: "admin123",
  role: "admin",
  firstName: "Haleemah",
  lastName: "Anwary",
  city: "Tornonto",
  postalCode: "M1B 3C5",
}

// insertClient(admin);
// console.log(await fetchClients())
// Export functions
const db = {
  insertClient,
  fetchClients,
  fetchClient,
  addFeedback,
};

export default db;
