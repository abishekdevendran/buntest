import authRouter from "@/controllers/auth";
import { setup } from "@/index";
import Elysia from "elysia";


const router = new Elysia()
  .use(setup)
  .use(authRouter)
  .get('/', () => ({
	message: 'Hello from Elysia!🦊',
}));

export default router;