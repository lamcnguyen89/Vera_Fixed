import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProcessingSchema = new Schema(
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
    v: {
      type: Number,
      required: false,
    },
    // sensei
    n: {
      type: Number,
      required: false,
    },
    // gazepoint
    fpogx: {
      type: Number,
      required: false,
    },
    fpogy: {
      type: Number,
      required: false,
    },
    fpogs: {
      type: Number,
      required: false,
    },
    fpogd: {
      type: Number,
      required: false,
    },
    fpogid: {
      type: Number,
      required: false,
    },
    fpogv: {
      type: Number,
      required: false,
    },
  },
  { collection: "processing" }
);

export default mongoose.model("processing", ProcessingSchema);
