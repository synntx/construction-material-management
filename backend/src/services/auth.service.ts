import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../prismaClient";
import appAssert from "../utils/assert";
import { UNAUTHORIZED } from "../constants/http";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface SigninData {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "my_secure_secret";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "1H";

export const signup = async ({ name, email, password }: SignupData) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const jwtOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    jwtOptions
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

export const signin = async ({ email, password }: SigninData) => {
  const user = await prisma.user.findUnique({ where: { email } });
  appAssert(user, UNAUTHORIZED, "Invalid credentials");

  const validPassword = await bcrypt.compare(password, user.password);

  appAssert(validPassword, UNAUTHORIZED, "Invalid credentials");

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token };
};
