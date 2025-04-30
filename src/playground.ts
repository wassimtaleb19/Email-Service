// this file is for testing prisma(database) and other things

import { db } from "./server/db";

const users = await db.user.findMany();
console.log("users: ", users);
