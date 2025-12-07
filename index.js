const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yt6dthx.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send('Paw Mart Server is running');
});

async function run() {
    try {
        await client.connect();

        const db = client.db('pawmart_db')
        const productsCollection = db.collection('products')
        const ordersCollection = db.collection('orders')
        const usersCollection = db.collection('users')

        //users api
        app.post('/users', async (req, res) => {
            const newUser = req.body;

            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({message: 'User already exists'});
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        });

        //products api
        app.get('/products', async (req, res) => {

            console.log(req.query);
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email;
            }


            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/latest-products', async (req, res) => {
            const cursor = productsCollection.find().sort({date : -1}).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });

        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                }
            };
            const result = await productsCollection.updateOne(query, update);
            res.send(result);
        });

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });


        //orders api
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email;
            }

            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Paw Mart Server is listening on port: ${port}`);
});