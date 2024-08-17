require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.chn7ebi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://techtore-9c206.web.app', 'https://techtore-9c206.firebaseapp.com'],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());

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
    const db = client.db('TechTroveDB');
    const productsCollection = db.collection('products');

    app.get('/products', async (req, res) => {
      const size = parseInt(req.query?.size);
      const page = parseInt(req.query?.page) - 1;
      const filter = req.query?.filter;
      const filterBrand = req.query?.filterBrand;
      const sortPrice = req.query?.sortPrice;
      const sortDate = req.query?.sortDate;
      const search = req.query?.search;

      let query = {
        name: { $regex: search || '', $options: 'i' },
      };
      if (filter) query.category = filter;
      if (filterBrand) query.brand = filterBrand;
      let options = {};
      if (sortPrice) options = { sort: { price: sortPrice === 'asc' ? 1 : -1 } };
      if (sortDate) options = { sort: { creation_date: sortDate === 'asc' ? 1 : -1 } };
      const products = await productsCollection
        .find(query, options)
        .skip(size * page)
        .limit(size)
        .toArray();
      res.send(products);
    });

    app.get('/count', async (req, res) => {
      const filter = req.query?.filter;
      const search = req.query?.search;
      const filterBrand = req.query?.filterBrand;

      let query = {
        name: { $regex: search || '', $options: 'i' },
      };
      if (filter) query.category = filter;
      if (filterBrand) query.brand = filterBrand;
      const count = await productsCollection.countDocuments(query);
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    // console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello, World from TechTore!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
