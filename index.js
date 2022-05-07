const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { verify } = require('jsonwebtoken');


require('dotenv').config();

const app = express();

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttauu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const mackbookCollection = client.db('ts-mackbook').collection('mackbooks')

        //get all post item and shaow all
        app.get('/products', async (req, res) => {
            const cursor = mackbookCollection.find({});
            const result = await cursor.toArray()
            res.send(result)
        })

        // get specific item 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await mackbookCollection.findOne(query);
            res.send(result)
            console.log("loaded");
        })

        //get my item
        // app.get('/product', async (req, res) => {
        //     const query = req.query;
        //     console.log(query);
        //     const cursor = mackbookCollection.find(query)
        //     const result = await cursor.toArray()
        //     res.send(result)
        // })
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = mackbookCollection.find(query);
                const order = await cursor.toArray();
                res.send(order)
            }
            else{
                res.status(403).send({message: "forbiden access"})
            }
        })

        //post products
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const tokenInfo = req.headers.authorization;

            const [email, accesstoken] = tokenInfo.split(" ")
            const decoded = verfyToken(accesstoken)
            if (email !== decoded.email) {
                res.send({ success: "unAuthorized user" })

            }
            else {
                const result = await mackbookCollection.insertOne(newProduct)
                res.send({success:"product add successfully"})

            }
        })

        // Update quantity
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const quantity = req.body.updatequantity;
            console.log(quantity);
            console.log(quantity);
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true };
            const updatePro = {
                $set: {
                    quantity
                }
            }
            const result = await mackbookCollection.updateOne(filter, updatePro, option);
            res.send(result)
        })

        //delete 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await mackbookCollection.deleteOne(query);
            res.send(result)
        })

        //jwt ganarate 
        app.post('/login', async (req, res) => {
            const email = req.body;
            // console.log(email);

            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            // console.log("token ", token);
            res.send({ token: token })

        })

    }
    finally {

    }

}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('ts-mackbook is running')
})

app.listen(port, () => {
    console.log(`port is running on`, port)
})


const verfyToken = (token) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            email = 'invalid email'
        }
        if (decoded) {

            console.log(decoded);
            email = decoded;
        }
    });
    return email;
}

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unothorized user" })
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: "forbiden Access" })
        }
        console.log("decoded ", decoded);
        req.decoded = decoded;
        next()
    })
    
}