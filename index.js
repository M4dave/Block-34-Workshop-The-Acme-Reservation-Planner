import express from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import {
  createCustomer,
  createRestaurant,
  createReservation,
  readAllCustomers,
  readAllRestaurants,
} from "./db.js";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(chalk.blue(`Server is running on http://localhost:${PORT}`));
  });
};

startServer();

app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant API!");
});

app.get("/customers", async (req, res) => {
  const customers = await readAllCustomers();
  res.json(customers);
});

app.get("/restaurants", async (req, res) => {
  const restaurants = await readAllRestaurants();
  res.json(restaurants);
});

app.post("/customers", async (req, res) => {
  const { name } = req.query;
  const newCustomer = await createCustomer(name);
  res.json(newCustomer);
});

app.post("/restaurants", async (req, res) => {
  const { name, capacity } = req.query;
  const newRestaurant = await createRestaurant(name, capacity);
  res.json(newRestaurant);
});

app.post("/reservations", async (req, res) => {
  const { time, people, restaurant_id, customer_id } = req.query;
  const newReservation = await createReservation(
    time,
    people,
    restaurant_id,
    customer_id
  );
  res.json(newReservation);
});

app.get("*", (req, res) => {
  res.send("Route not found");
});
