const express=require('express');
const mongoose=require("mongoose");
const cors=require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const PORT = 8000;
app.use(cors());
app.use(bodyParser.json());

const {router: authRoutes, authenticateJWT} = require("./auth");
const cartRoutes= require("./cart");
app.use(authRoutes);
app.use(cartRoutes);

const productSchema = new mongoose.Schema({ name: String, price: Number });
const Product = mongoose.model("Product", productSchema);
// module.exports.Product = Product;

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  
  app.get("/products", async (req, res) => {
    try {
      const products = await Product.find().sort({ id: 1 }); // ascending by insertion
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  
  app.get("/product/:id", async (req,res)=>{
    try{
      const product = await Product.findById(req.params.id);
      if(!product){
        return res.status(404).json({message: "the items don't exist"})
      }
    }catch(err){
      res.status(500).json({error: "Internal Server Error"});
    }
  })
app.listen(PORT, ()=>{
    console.log("server is running on PORT", PORT);

})