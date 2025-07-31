const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Cart=mongoose.model("Cart", new mongoose.Schema({
    userId:String,
    items:[{
        productId:String,
        quantity:Number,
    }
    ],
    updatedAt: { type: Date, default: Date.now } // Add updatedAt field
}));

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
;

router.delete("/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  console.log(`Received request to delete product ${productId} from user ${userId}'s cart`);

  try {
    const carts = await Cart.find({ userId });

    if (carts.length === 0) {
      return res.status(404).json({ error: "Couldn't find any carts for this user" });
    }

    console.log("Current carts for user:", JSON.stringify(carts, null, 2));

    let productRemoved = false;

    for (const cart of carts) {
      console.log(`Processing cart ID: ${cart._id}`);

      const productIndex = cart.items.findIndex(item => item.productId === productId);
      if (productIndex !== -1) {
        console.log(`Found product ${productId} in cart ${cart._id}`);

        cart.items.splice(productIndex, 1);
        cart.updatedAt = new Date();

        console.log("Updated items in cart after removal:", cart.items);

        if (cart.items.length === 0) {
          await Cart.deleteOne({ _id: cart._id });
          console.log(`Cart ${cart._id} deleted as it is empty.`);
        } else {
          await cart.save();
          console.log(`Product removed from cart ${cart._id}.`);
        }

        productRemoved = true;
        break; // Exit the loop after removing the first occurrence
      } else {
        console.log(`Product ${productId} not found in cart ${cart._id}`);
      }
    }

    if (!productRemoved) {
      return res.status(400).json({ message: "Item is not present in any cart" });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: err.message,
    });
  }
});

module.exports = router;
