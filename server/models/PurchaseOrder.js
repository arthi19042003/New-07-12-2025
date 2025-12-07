const mongoose = require("mongoose");

const PurchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true }, 
    candidateName: { type: String, required: true },
    positionTitle: { type: String, required: true },
    department: { type: String },
    rate: { type: Number, required: true },
    startDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Draft", "Sent", "Paid", "Cancelled"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);