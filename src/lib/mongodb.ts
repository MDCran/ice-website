import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn(
    "MONGODB_URI not defined in environment variables. Contact form submissions will fail."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};
global.mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String },
    phone: { type: String },
    service: { type: String },
    message: { type: String, required: true },
    smsConsent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "contacts" }
);

export const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

const subscriberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    phone: { type: String, required: true },
    smsConsent: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "subscribers" }
);

export const Subscriber =
  mongoose.models.Subscriber ||
  mongoose.model("Subscriber", subscriberSchema);

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["white-papers", "case-studies", "architecture-guides", "technical-docs"],
      required: true,
    },
    pdfUrl: { type: String },
    coverImage: { type: String },
    published: { type: Boolean, default: true },
    comingSoon: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "resources" }
);

export const Resource =
  mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
