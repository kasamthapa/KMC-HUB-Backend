import express, { Application } from "express";
import cors from "cors";
import { connectDB } from "./config/DatabaseConnect";
import userAuth from "./features/auth/api/auth.routes";
import postRoute from "./features/collaboration_feed/api/posts.routes";
const app: Application = express();
const port = 3000;
connectDB();

const allowedOrigins = "http://localhost:5173";
// Configure CORS options
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin || "")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/v1/auth", userAuth);
app.use("/api/v1/posts", postRoute);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
