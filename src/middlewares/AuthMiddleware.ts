import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
}
interface CustomRequest extends Request {
  user?: JwtPayload;
}
enum Role {
  Student = "Student",
  Teacher = "Teacher",
  Admin = "Admin",
}

const authAllRoles = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers["authorization"];
  const token = auth && auth.split[" "][1];
  if (!token) {
    res.status(403).json({
      message: " Missing token1",
    });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Error verifying token:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const verifyRole = (requiredRole: Role) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const auth = req.headers["authorization"];
    const token = auth && auth.split[" "][1];
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
