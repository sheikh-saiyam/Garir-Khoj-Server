const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
// middlewares

// MongoDB Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vocag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// custom client code for connecting to DB
const client = new MongoClient(uri, {
  tls: true,
  serverSelectionTimeoutMS: 3000,
  autoSelectFamily: false,
});
// custom client code for connecting to DB

async function run() {
  try {
    await client.connect(); // deployment off
    // <-----ALL DB & COLLECTIONS-----> \\
    const carCollection = client.db("carDB").collection("cars");
    const bookingCollection = client.db("bookingDB").collection("bookings");
    // <-----ALL DB & COLLECTIONS-----> \\

    // <---------- ALL CRUD FUNCTIONALITY ----------> \\

    // <-----Car CRUD Functionality-----> \\

    // <---Add New Car To DB---> // CREATE
    app.post("/add-car", async (req, res) => {
      const newCarData = req.body;
      const result = await carCollection.insertOne(newCarData);
      res.send(result);
    });
    // <---Add New Car To DB---> // CREATE

    // <---Add Available-Cars Data with search,sorting functionality to Server--->//READ
    app.get("/available-cars", async (req, res) => {
      const search = req.query.search;
      const sortByPrice = req.query.sortByPrice;
      const sortByDate = req.query.sortByDate;
      let query = { car_model: { $regex: search, $options: "i" } };
      let options = {};
      if (sortByPrice) {
        options.sort = {
          ...options.sort,
          daily_rental_price: sortByPrice === "asc" ? 1 : -1,
        };
      }
      if (sortByDate) {
        options.sort = {
          ...options.sort,
          added_date: sortByDate === "asc" ? 1 : -1,
        };
      }
      const result = await carCollection.find(query, options).toArray();
      res.send(result);
    });
    // <---Add Available-Cars Data with search,sorting functionality to Server--->// READ

    // <---Get latest Car data for home page recent-listings---> // READ
    app.get("/recent-listings", async (req, res) => {
      const result = await carCollection
        .find()
        .sort({ added_date: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    // <---Get latest Car data for home page recent-listings---> // READ

    // <--Add Cars to server base on email---> // READ //
    app.get("/cars/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "user_details.email": email };
      const result = await carCollection.find(query).toArray();
      res.send(result);
    });
    // <--Add Cars to server base on email---> // READ //

    // Add Single Car Data To Server base on _id // READ //
    app.get("/car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.send(result);
    });
    // Add Single Car Data To Server base on _id // READ //

    // <---Update Car---> // UPDATE
    app.put("/update-car/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const carData = req.body;
      const updatedCarData = {
        $set: carData,
      };
      const options = { upsert: true };
      const result = await carCollection.updateOne(
        filter,
        updatedCarData,
        options
      );
      res.send(result);
    });
    // <---Update Car---> // UPDATE

    // <---Delete A Car---> // DELETE //
    app.delete("/car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });
    // <---Delete A Car---> // DELETE //

    // <-----Car CRUD Functionality-----> \\

    // <-----Booking CRUD Functionality-----> \\

    // <---Post A New Booking---> // CREATE
    app.post("/booking", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      // Increase Car BookingCount
      const filter = { _id: new ObjectId(newBooking.car_id) };
      const updatedBookingCount = {
        $inc: { bookingCount: 1 },
      };
      await carCollection.updateOne(filter, updatedBookingCount);
      // Increase Car BookingCount
      res.send(result);
    });
    // <---Post A New Booking---> // CREATE

    // <---Add Bookings to server base on booked_user_email---> // READ
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { booked_user_email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    // <---Add Bookings to server base on booked_user_email---> // READ

    // <-----Booking CRUD Functionality-----> \\

    // <---------- ALL CRUD FUNCTIONALITY ----------> \\

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log("Error caught-->", error);
  }
}
run().catch(console.dir);
// MongoDB Setup

app.get("/", (req, res) => {
  res.send("ph-b10-assignment11 Server Is Running");
});

app.listen(port, () => {
  console.log(`ph-b10-assignment11 Server Is Running On Port: ${port}`);
});
