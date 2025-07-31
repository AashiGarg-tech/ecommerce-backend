const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Cart=mongoose.model("Cart", new mongoose.Schema({
    userId:String,
    items:[{
        productId:String,
        quantity:Number,
    }
    ]
}))

router.post("/cart/add", async (req, res)=>{
    try{
        const {productId, quantity=1, user} = req.body;

        if(!productId || !user){
            return res.status(400).json({message: "ProductId and User is required"});
        }

        let cart = await Cart.findOne({userId:user, status:'active'});

        if(!cart){
            cart = new Cart({userId:user, items:[], status:'active'});
        }

        const existingItemIndex = cart.items.findIndex(item=>item.productId === productId);

        if(existingItemIndex>-1){
            cart.items[existingItemIndex].quantity+=parseInt(quantity)
        }else{
            cart.items.push({
                productId, 
                quantity:parseInt(quantity),
            });
        }

        cart.updateAt = new Date();
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Item added to cart",
            data: cart,
          });
    }catch(err){
        console.error(err);
        res.status(500).json({error: "internal server error. Couldn't add item"});
    }
})

router.get("/carts",async (req,res)=>{
    try{
        const carts = await Cart.find({});
        res.status(200).json({
            success: true,
            count: carts.length,
            data: carts,
        })
    }catch(err){
        console.log("error fetching cart", err);
        res.status(500).json({
            success:false,
            message: "failed to fetch data",
            error: err.message,
        })
    }
})

router.delete("/cart/:userId/:id", async (req, res) => {
    const { userId, id } = req.params;
    try {
      const cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ error: "Couldn't find cart" });
      }
  
      // Check if product exists in cart
      const productInCart = cart.items.find(item => item.productId === id);
      if (!productInCart) {
        return res.status(400).json({ message: "Item is not present in cart" });
      }
  
      // Remove the item
      cart.items = cart.items.filter(item => item.productId !== id);
      cart.updatedAt = new Date();
  
      // If no items left, delete the whole cart
      if (cart.items.length === 0) {
        await Cart.deleteOne({ _id: cart._id });
        return res.status(200).json({
          success: true,
          message: "Product removed and cart deleted (empty)"
        });
      } else {
        await cart.save();
        return res.status(200).json({
          success: true,
          message: "Product removed from cart"
        });
      }
  
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to delete item",
        error: err.message,
      });
    }
  });
  

module.exports=router;