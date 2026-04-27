import { Router } from "express";
import { messagesRouter } from "../controllers/messages.controller.js";

export default Router().use(messagesRouter);
