const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je2pvxf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyCollection = client.db("Toys").collection("allToys");

    // const indexKey = { toyName: 1, price: 1 };
    // const indexOptions = { name: "toyName" };
    // const result = await toyCollection.createIndex(indexKey, indexOptions);

    // search api

    app.get("/toySearch/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { toyName: { $regex: searchText, $options: "i" } },
            { price: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.json(result);
    });

    app.post("/allToys", async (req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      res.json(result);
    });

    // all toys api

    app.get("/toys", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const cursor = toyCollection.find().limit(limit);
      const result = await cursor.toArray();
      res.json(result);
    });

    // my toys api by email

    app.get("/myToys", async (req, res) => {
      let query = {}; 
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = toyCollection.find(query).sort({ price: "asc" });
      const result = await cursor.toArray();
      res.json(result);
    });
    // single toy api
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.json(result);
    });

    // update toys api

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = req.body;
      const toy = {
        $set: {
          price: updateDoc.price,
          quantity: updateDoc.quantity,
          description: updateDoc.description,
        },
      };
      const result = await toyCollection.updateOne(query, toy, options);
      res.json(result);
    });

    // delete toys api

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.json(result);
    });

    //sub category api
    app.get("/subCategory", async (req, res) => {
      console.log(req.query.select);
      let query = {};
      if (req.query.select) {
        query = { select: req.query.select };
      }
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/allToys/:text", async (req, res) => {
      console.log(req.params.text);
      if (
        req.params.text === "Lion" ||
        req.params.text === "Cat" ||
        req.params.text === "Teddy" ||
        req.params.text === "Horse" ||
        req.params.text === "Mouse" ||
        req.params.text === "Tiger" 
      ) {
        const result = await toyCollection
          .find({ select: req.params.text })
          .toArray();
        return res.json(result);
      }
      const result = await toyCollection.find({}).toArray()
      res.json(result)
    }); 

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.json("server is running");
});

app.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
