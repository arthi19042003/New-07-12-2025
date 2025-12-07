const express = require("express");
const router = express.Router();
const PurchaseOrder = require("../models/PurchaseOrder");
const auth = require("../middleware/auth"); 

router.post("/", auth, async (req, res) => {
  try {
    const { poId, vendor, amount, date } = req.body;

    if (!poId || !vendor || !amount || !date) {
      return res.status(400).json({ message: "PO ID, Vendor, Amount, and Date are required." });
    }
    
    const existingPO = await PurchaseOrder.findOne({ poId });
    if (existingPO) {
      return res.status(400).json({ message: "Purchase Order ID already exists." });
    }

    const newOrder = new PurchaseOrder({
      poId,
      vendor,
      amount,
      date,
      status: "Pending", 
    });

    await newOrder.save();
    res.status(201).json(newOrder);

  } catch (error) {
    console.error("❌ Error creating purchase order:", error.message);
    res.status(500).json({ message: "Server error creating purchase order" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 }); 
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching purchase orders:", error.message);
    res.status(500).json({ message: "Server error fetching purchase orders" });
  }
});

router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Error updating status:", error.message);
    res.status(500).json({ message: "Server error updating status" });
  }
});

module.exports = router;