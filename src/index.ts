import express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

const userSchema = z.object({
  name: z.string().min(2, "Name must be longer than 2 characters"),
  email: z.string().email("Invalid email format"),
});

// Define both the request body interface
interface UserRequestBody {
  name: string;
  email: string;
}

// Define the handler with explicit return type
const insertion = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json(result.error.format());
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
      },
    });
    
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to save user" });
  }
};

// Register the route handler
app.post("/users", insertion);
app.get("/allusers",async (_,res)=>{
  const users= await prisma.user.findMany();
  res.json(users);
});
app
app.listen(3000, () => console.log("Server is running on port 3000"));