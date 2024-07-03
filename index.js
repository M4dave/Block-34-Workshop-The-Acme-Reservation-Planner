import express from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import {
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  getReservations,
  getCustomers,
  getRestaurants,
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
  res.json({ message: "hello from the server" });
});

app.get("/create-tables", async (req, res) => {
  await createTables();
  res.json({ message: "tables created" });
});

app.get("/create-customer", async (req, res) => {
  const { name } = req.query;
  const customer = await createCustomer(name);
  res.json(customer);
});

app.get("/create-restaurant", async (req, res) => {
  const { name, capacity } = req.query;
  const restaurant = await createRestaurant(name, capacity);
  res.json(restaurant);
});

app.get("/create-reservation", async (req, res) => {
  const { time, date, party_count, restaurant_id, customer_id } = req.query;
  const reservation = await createReservation(
    time,
    date,
    party_count,
    restaurant_id,
    customer_id
  );
  res.json(reservation);
});

app.get("/reservations", async (req, res) => {
  const reservations = await getReservations();
  res.json(reservations);
});

app.get("/customers", async (req, res) => {
  const customers = await getCustomers();
  res.json(customers);
});

app.get("/restaurants", async (req, res) => {
  const restaurants = await getRestaurants();
  res.json(restaurants);
});

