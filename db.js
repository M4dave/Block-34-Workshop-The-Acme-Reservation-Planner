import pg from "pg";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://localhost:5432/the_acme_reservation_planner"
);

const createTables = async () => {
  try {
    await client.connect();
    const SQL = `
            CREATE TABLE IF NOT EXISTS "uuid-ossp";

            DROP TABLE IF EXISTS Reservations;
            DROP TABLE IF EXISTS Customers;
            DROP TABLE IF EXISTS Restaurants;

           
            CREATE TABLE Restaurants (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                capacity INTEGER NOT NULL
            );
            
            
            CREATE TABLE Customers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL
            );

            CREATE TABLE Reservations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                time TIMESTAMP NOT NULL,
                date DATE DEFAULT CURRENT_DATE,
                party_count INTEGER NOT NULL,
                restaurant_id UUID REFERENCES Restaurants(id),
                customer_id UUID REFERENCES Customers(id)
                FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id),
                FOREIGN KEY (customer_id) REFERENCES Customers(id)
            );

            `;
    await client.query(SQL);
    console.log(chalk.green("tables created"));
  } catch (error) {
    console.log(chalk.red(`error creating tables: ${error}`));
  }
};

const createCustomer = async (name) => {
  try {
    await client.connect();
    const SQL = `INSERT INTO Customers (name) VALUES ($1) RETURNING *`;
    const response = await client.query(SQL, [name]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error creating customer: ${error}`));
  }
};

const createRestaurant = async (name, capacity) => {
  try {
    await client.connect();
    const SQL = `INSERT INTO Restaurants (name, capacity) VALUES ($1, $2) RETURNING *`;
    const response = await client.query(SQL, [name, capacity]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error creating restaurant: ${error}`));
  }
};

const fetchCustomers = async () => {
  try {
    await client.connect();
    const SQL = `SELECT * FROM Customers`;
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.log(chalk.red(`error fetching customers: ${error}`));
  }
};

const fetchRestaurants = async () => {
  try {
    await client.connect();
    const SQL = `SELECT * FROM Restaurants`;
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.log(chalk.red(`error fetching restaurants: ${error}`));
  }
};

const createReservation = async (
  time,
  party_count,
  restaurant_id,
  customer_id
) => {
  try {
    await client.connect();
    const SQL = `INSERT INTO Reservations (time, party_count, restaurant_id, customer_id) VALUES ($1, $2, $3, $4) RETURNING *`;
    const response = await client.query(SQL, [
      time,
      party_count,
      restaurant_id,
      customer_id,
    ]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error creating reservation: ${error}`));
  }
};

const destroyReservation = async (id) => {
  try {
    await client.connect();
    const SQL = `DELETE FROM Reservations WHERE id = $1`;
    await client.query(SQL, [id]);
    return true;
  } catch (error) {
    console.log(chalk.red(`error deleting reservation: ${error}`));
  }
};

export {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
};
