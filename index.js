const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

//middelware

app.use(cors());
app.use(express.json());

//jwt

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}
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

    //auth

    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3d",
      });
      res.send({ accessToken });
    });
    //inventory full api
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    //myitem
    // app.get("/myitem", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const cursor = productCollection.find(query);
    //   const products = await cursor.toArray();
    //   res.send(products);
    // });
    ///myitem jwt
    app.get("/myitem", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
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
      const user = req.body;

      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const updateDoc = { $set: { quantity: user.newQty, sold: user.newSold } };
      const result = await productCollection.updateOne(
        query,

        updateDoc
      );
      res.send(result);
    });
    //
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
