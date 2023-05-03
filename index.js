const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const app = express();
app.use(bodyParser.json({ extended: true }));
const PORT = process.env.PORT || 5000;

mongoose.connect("mongodb+srv://isaac:1021mki@storedb.pa5ijsd.mongodb.net/storeDB?retryWrites=true&w=majority")
.then(() => {
    app.listen(PORT, () => {
        console.log("Connected to DB & Listening on port " + PORT + "...");
    });
})
.catch((error) => {
    console.log(error)
})

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    img: Number
}, {timestamps: true});

const orderSchema = new mongoose.Schema({
    product: String,
    price: String,
    img: Number,
    name: String,
    email: String,
    card: String,
    addr: String,
    quantity: Number,
    orderId: Number
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Admin = mongoose.model("Admin", adminSchema);

const convertProductsDB = (dbData) => {
    const dataToSend = [];
    for (var i = 1; i <= dbData.length / 4; i++) {
        dataToSend.push([]);
    }

    var count = 0;
    dataToSend.forEach(arr => {
        arr.push(
            {
                "name": dbData[count].name,
                "price": dbData[count].price,
                "img": dbData[count].img
            },
            {
                "name": dbData[count + 1].name,
                "price": dbData[count + 1].price,
                "img": dbData[count + 1].img
            },
            {
                "name": dbData[count + 2].name,
                "price": dbData[count + 2].price,
                "img": dbData[count + 2].img
            },
            {
                "name": dbData[count + 3].name,
                "price": dbData[count + 3].price,
                "img": dbData[count + 3].img
            });
        count = count + 4;
    });

    return dataToSend;
}

const convertOrdersDB = (OrdersDB) => {
    const ordersList = [];
    for (var i = 0; i < OrdersDB.length; i++) {
        ordersList.push(
            {
                "product": OrdersDB[i].product,
                "price": OrdersDB[i].price,
                "img": OrdersDB[i].img,
                "name": OrdersDB[i].name,
                "email": OrdersDB[i].email,
                "addr": OrdersDB[i].addr,
                "quantity": OrdersDB[i].quantity,
                "orderId": OrdersDB[i].orderId
            }
        );
    }
    return ordersList;
}

app.get("/products", (req, res) => {
    Product.find().then((data) => {
        res.send(convertProductsDB(data));
        console.log("Sent Products");
    });
});

app.get("/orders", (req, res) => {
    Order.find().then(data => {
        res.send(convertOrdersDB(data));
        console.log("Sent Orders");
    })
});

app.post("/add-order", (req, res) => {
    const data = req.body;
    Order.find().then(obj => {
        data.orderId = obj.length;
        Order.insertMany(data);
        console.log("Added Order!");
    });
});

app.post('/rm-order', (req, res) => {
    Order.deleteOne({ orderId: req.body.theId }).then(() => {
    });
    console.log("Order Removed");
});

app.post('/admin-login', (req, res) => {
    const usrn = req.body.usrn;
    const pass = req.body.pass;
    Admin.find().then(admins => {
        var count = 0;
        admins.forEach(admin => {
            if(pass === admin.password && usrn == admin.username){
                count++;
            }
        });
        if (count > 0){
            res.send("GOOD");
        }
        else if (count === 0){
            res.send("BAD");
        }

        console.log("Admin Requested");
    });
});