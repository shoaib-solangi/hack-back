import express from "express";
import cors from "cors";
import userRoutes from "./routers/auth.js";


import loanRoutes from "./routers/loan.js";
import authRoutes  from "./routers/user.js";




const app = express();

// Middleware
app.use(cors("*"));
app.use(express.json());

// Routes
app.use("/auth", userRoutes);
app.use("/loans", loanRoutes);
app.use("/user", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

