import { Request, Response } from "express";
import { z } from "zod";
import bcrypt, { genSalt } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../../../middlewares/AuthMiddleware";
import {
  userSignupSchema,
  UserSignup,
  UserLogin,
  userLoginSchema,
} from "../schemas/auth.schema";
import userModel from "../models/user";
// import { RequestHandler } from "express-serve-static-core";

export const userSignupController = async (
  req: Request<object, object, UserSignup>,
  res: Response
) => {
  try {
    //zod schme validation
    const { idNumber, name, email, password, role } = userSignupSchema.parse(
      req.body
    );
    //email unique check
    if (await userModel.findOne({ email })) {
      res.status(400).json({
        message: "User with this email already exists!",
      });
      return;
    }
    if (role === "Student" && (await userModel.findOne({ idNumber }))) {
      res.status(400).json({
        message: "User with this idNumber already exists!",
      });
      return;
    }
    //Salt genertion for hash
    const salt = await genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //Create User
    const User = await userModel.create({
      idNumber: role === "Student" ? idNumber : undefined,
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    });
    res.status(200).json({
      message: "User signed up successfully!",
      User,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
      return;
    }
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
    return;
  }
};

export const userLoginController = async (
  req: Request<object, object, UserLogin>,
  res: Response
) => {
  try {
    const { email, password } = userLoginSchema.parse(req.body);

    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    //Verify password with user password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "User Logged in successfully!",
      token,
      User: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: e.errors });
      return;
    }
    res
      .status(500)
      .json({ message: "Server error", error: (e as Error).message });
    return;
  }
};
export const getCurrentUser = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await userModel
      .findById(userId)
      .select("name email avatar role");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Error fetching user:", e);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
