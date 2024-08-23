import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MLOutSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    t: {
      type: String,
      required: true,
    },
    ms: {
      type: Number,
      required: true,
    },
    emotions: {
      type: String,
      required: false,
    },
  },
  { collection: "ml_out" }
);

export default mongoose.model("ml_out", MLOutSchema);
