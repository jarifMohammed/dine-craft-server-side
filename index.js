const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.trszs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const db = client.db('foodsDB')

    const foodsCollection = db.collection('foods')

    // save data in mongo db
    app.post('/add-foods' , async(req,res)=>{
      const foodData = req.body
      const result = await foodsCollection.insertOne(foodData)
      // console.log(result);
      res.send(result)
    })
    // GET ALL FOODS DATA TO RENDER IN CARD
    app.get('/foods', async(req,res)=>{
      const result =await foodsCollection.find().toArray()
      res.send(result)
    })
    // get all foods added a specific user
    app.get('/foods/:email' , async (req,res)=>{
      const email = req.params.email
      const query = {'addBy.addedBy' :email}
      const result = await foodsCollection.find(query).toArray()
      res.send(result)

    })
    // delete 
    app.delete('/food/:id' , async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await foodsCollection.deleteOne(query)
      res.send(result)
    })

    // get a single data for GET with id
    app.get('/food/:id' , async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await foodsCollection.findOne(query)
      res.send(result)
    })
// updaTE FOOD
app.put('/update-food/:id', async (req,res)=>{
  const id =  req.params.id
  const foodData = req.body
  const updated = {
    $set : foodData,
  }
  const query = {_id : new ObjectId(id)}
  const options = { upsert: true}

  const result = await foodsCollection.updateOne(query, updated,options)
  // console.log(result);
  res.send(result)
  })






























    // Ping MongoDB to verify connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Connection stays open for API usage
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello server is runnig fro dine -craft');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
