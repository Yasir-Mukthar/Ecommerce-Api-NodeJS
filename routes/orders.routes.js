
import { Router } from "express";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItems.model.js"; // Add this line

const router = Router();



router.get("/orders", async (req, res) => {
    try {
        const orderList = await Order.find().populate("user", "name").sort({ "dateOrdered": -1 });

        if (orderList.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found" });
        }
        res.status(200).json(orderList);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name")
            .populate({
                path: "orderItems",
                populate: {
                    path: "product",
                    populate: "category",
                },
            });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/orders", async (req, res) => {
  try {
  
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    }
    ));
    
      const orderItemsIdsResolved = await orderItemsIds;

      const totalPriceArray = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate("product", "price");
        const totalPrice = orderItem.product.price * orderItem.quantity;
        await OrderItem.updateOne({ _id: orderItemId }, { totalPrice: totalPrice });
        return totalPrice;
      }));

      const totalPrice = totalPriceArray.reduce((acc, curr) => acc + curr, 0);

    let order = new Order({
      orderItems:orderItemsIdsResolved ,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    order = await order.save();
    if (!order) {
      return res.status(404).send("The order cannot be created");
    }
    res.send(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/orders/:id", async (req, res) => {
  // Update an existing order by ID
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).send("The order cannot be updated");
    }
    res.send(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
);

router.delete("/orders/:id", async (req, res) => {
  // Delete an existing order by ID
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await order.orderItems.map(async (orderItem) => {
      await OrderItem.findByIdAndDelete(orderItem);
    });
    return res.status(200).json({ success: true, message: "The order is deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
);

router.get("/orders/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    if (!totalSales) {
      return res.status(400).send("The order sales cannot be generated");
    }
    res.send({ totalsales: totalSales.pop().totalsales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
);

router.get("/orders/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
      return res.status(400).send("The order count cannot be generated");
    }
    res.send({ orderCount: orderCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/orders/get/userorders/:userid", async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ "dateOrdered": -1 });
    if (userOrderList.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }
    res.status(200).json(userOrderList);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
);
export default router;
