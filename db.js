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
                people INTEGER NOT NULL,
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
    const SQL = "INSERT INTO Customers(name) VALUES($1) RETURNING *";
    const response = await client.query(SQL, [name]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error creating customer: ${error}`));
  }
};

const createRestaurant = async (name, capacity) => {
  try {
    const SQL =
      "INSERT INTO Restaurants(name, capacity) VALUES($1, $2) RETURNING *";
    const response = await client.query(SQL, [name, capacity]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error creating restaurant: ${error}`));
  }
};

const createReservation = async (time, people, restaurant_id, customer_id) => {
  try {
    const SQL =
      "INSERT INTO Reservations(time, people, restaurant_id, customer_id) VALUES($1, $2, $3, $4) RETURNING *";
    const response = await client.query(SQL, [
      time,
      people,
      restaurant_id,
      customer_id,
    ]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error creating reservation: ${error}`));
  }
};

const readAllCustomers = async () => {
  try {
    const SQL = "SELECT * FROM Customers";
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.log(chalk.red(`error reading all customers: ${error}`));
  }
};

const readAllRestaurants = async () => {
  try {
    const SQL = "SELECT * FROM Restaurants";
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.log(chalk.red(`error reading all restaurants: ${error}`));
  }
};

const readAllReservations = async () => {
  try {
    const SQL = "SELECT * FROM Reservations";
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.log(chalk.red(`error reading all reservations: ${error}`));
  }
};

const readAllReservationsByRestaurant = async (restaurant_id) => {
  try {
    const SQL = "SELECT * FROM Reservations WHERE restaurant_id = $1";
    const response = await client.query(SQL, [restaurant_id]);
    return response.rows;
  } catch (error) {
    console.log(
      chalk.red(`error reading all reservations by restaurant: ${error}`)
    );
  }
};

const readAllReservationsByCustomer = async (customer_id) => {
  try {
    const SQL = "SELECT * FROM Reservations WHERE customer_id = $1";
    const response = await client.query(SQL, [customer_id]);
    return response.rows;
  } catch (error) {
    console.log(
      chalk.red(`error reading all reservations by customer: ${error}`)
    );
  }
};

const updateReservation = async (
  id,
  time,
  people,
  restaurant_id,
  customer_id
) => {
  try {
    const SQL =
      "UPDATE Reservations SET time = $1, people = $2, restaurant_id = $3, customer_id = $4 WHERE id = $5 RETURNING *";
    const response = await client.query(SQL, [
      time,
      people,
      restaurant_id,
      customer_id,
      id,
    ]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error updating reservation: ${error}`));
  }
};

const deleteReservation = async (id) => {
  try {
    const SQL = "DELETE FROM Reservations WHERE id = $1 RETURNING *";
    const response = await client.query(SQL, [id]);
    return response.rows[0];
  } catch (error) {
    console.log(chalk.red(`error deleting reservation: ${error}`));
  }
};

const syncAndSeed = async () => {
  try {
    await createTables();
    const [moe, lucy, larry] = await Promise.all([
      createCustomer("Moe"),
      createCustomer("Lucy"),
      createCustomer("Larry"),
    ]);
    const [joes, lulus, moes] = await Promise.all([
      createRestaurant("Joes", 3),
      createRestaurant("Lulus", 4),
      createRestaurant("Moes", 5),
    ]);
    const [r1, r2, r3] = await Promise.all([
      createReservation(new Date(), 2, joes.id, moe.id),
      createReservation(new Date(), 3, lulus.id, lucy.id),
      createReservation(new Date(), 4, moes.id, larry.id),
    ]);
    console.log(chalk.green("database seeded"));
  } catch (error) {
    console.log(chalk.red(`error seeding database: ${error}`));
  }
};

export {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  readAllCustomers,
  readAllRestaurants,
  readAllReservations,
  readAllReservationsByRestaurant,
  readAllReservationsByCustomer,
  updateReservation,
  deleteReservation,
  syncAndSeed,
};