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
      let query = { car_model: { $regex: search, $options: "i" } };
      let options = {};
      if (sortByPrice) {
        options = {
          sort: { daily_rental_price: sortByPrice === "asc" ? 1 : -1 },
        };
      }
      const result = await carCollection.find(query, options).toArray();
      res.send(result);
    });
    // <---Add Available-Cars Data with search,sorting functionality to Server--->// READ

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

    // <-----Car CRUD Functionality-----> \\

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
