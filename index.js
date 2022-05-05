const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


require('dotenv').config();

const app = express();

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttauu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect()
        const mackbookCollection = client.db('ts-mackbook').collection('mackbooks')

        //get all post item and shaow all
        app.get('/products', async(req,res)=>{
            const cursor = mackbookCollection.find({});
            const result = await cursor.toArray()
            res.send(result)
        })
    
        // get specific item 
        app.get('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await mackbookCollection.findOne(query);
            res.send(result)
            console.log("loaded");
        })

        //get my item
        app.get('/product', async(req,res)=>{
            const query = req.query;
            console.log(query);
            const cursor = mackbookCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //post products
        app.post('/products',async(req,res)=>{
            const newProduct = req.body;
            const result = await mackbookCollection.insertOne(newProduct)
            res.send(result)
        })

        // Update quantity
        app.put('/products/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const quantity = req.body.updatequantity;
            console.log(quantity);
            console.log(quantity);
            const filter = {_id: ObjectId(id)}
            const option = {upsert: true };
            const updatePro = {
                $set: {
                    quantity
                }
            }
            const result = await mackbookCollection.updateOne(filter,updatePro,option);
            res.send(result)
        })

        //delete 
        app.delete('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await mackbookCollection.deleteOne(query);
            res.send(result)
        })
    }
    finally{

    }

}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('ts-mackbook is running')
  })
  
  app.listen(port, () => {
    console.log(`port is running on`, port)
  })