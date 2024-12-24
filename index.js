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
    const orderCollection = db.collection('orders')

    // save data in mongo db
    app.post('/add-foods' , async(req,res)=>{
      const foodData = req.body
      const result = await foodsCollection.insertOne(foodData)
      // console.log(result);
      res.send(result)
    })
    // GET ALL FOODS DATA TO RENDER IN CARD
    app.get('/foods', async(req, res) => {
      const search = req.query.search || ''; // Get search query
      const query = search
        ? { name: { $regex: search, $options: 'i' } } // Case-insensitive search by name
        : {}; // No filter if search is empty
    
      try {
        const result = await foodsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving foods');
      }
    });
    
    
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
//////  purchase food
app.post('/purchase' , async (req,res)=>{
  // saving order to db
  const orderData = req.body
  const result = await orderCollection.insertOne(orderData)


  // now incrase total sold in foods db
  const filter = {_id: new ObjectId(orderData.foodId)}
  const update = {
    $inc:{total_sold: 1}
  }
  const updateCount = await foodsCollection.updateOne(filter, update)
  res.send(result)
})


// get all orders of a single user

app.get('/orders/:email', async(req,res)=>{
  const email = req.params.email
  const query = {buyerEmail:email}

const result = await orderCollection.find(query).toArray()
res.send(result)


})

// delete 
app.delete('/orders/:id' , async(req,res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await orderCollection.deleteOne(query)
  res.send(result)
})

app.get('/all-orders/:email', async(req,res)=>{
  const email = req.params.email
  const query = {addBy:email}

const result = await orderCollection.find(query).toArray()
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
