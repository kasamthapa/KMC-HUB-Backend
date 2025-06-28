import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  role: string;
}
export interface CustomRequest extends Request {
  user?: JwtPayload;
}
enum Role {
  Student = "Student",
  Teacher = "Teacher",
  Admin = "Admin",
}

export const authAllRoles = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader); // Debug
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      console.log("No token provided");
       res.status(401).json({ message: "No token provided" });
       return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log("Decoded JWT:", decoded); // Debug
    req.user = decoded;
    next();
  } catch (e) {
    console.error("Auth middleware error:", e);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
const verifyRole = (requiredRole: Role) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const auth = req.headers["authorization"];
    const token = auth && auth.split(" ")[1];
    if (!token) {
      res.status(403).json({
        message: " Missing token1",
      });
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      if (decoded.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: `Access denied: ${requiredRole} role required` });
      }
      req.user = decoded;
      next();
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        return res.status(401).json({ message: "Token expired" });
      }
      if (e instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token" });
      }
      console.error("Error verifying token:", e);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

export const authAll = authAllRoles;
export const studentAuth = verifyRole(Role.Student);
export const AdminAuth = verifyRole(Role.Admin);
export const TeacherAuth = verifyRole(Role.Teacher);
