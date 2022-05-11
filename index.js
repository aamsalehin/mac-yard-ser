const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

//middelware

app.use(cors());
app.use(express.json());
//api
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zobm7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("mac-yard").collection("products");
    //inventory full api
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    //single product detail api
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    //post new item api
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      const result = await productCollection.insertOne(newItem);
      res.send(result);
    });
    //delete one api
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/inventory/:id", async (req, res) => {
      console.log("hi");
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
    });
  } finally {
  }
}
run().catch(console.dir());
// perform actions on the collection object

app.get("/", (req, res) => {
  res.send("server is running");
});
//listen to port
app.listen(port, () => {
  console.log("listening to port" + port);
});
