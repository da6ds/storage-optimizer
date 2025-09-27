import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve simulation data files
  app.use('/data', express.static(path.resolve(process.cwd(), 'data')));
  app.use('/config', express.static(path.resolve(process.cwd(), 'config')));
  app.use('/i18n', express.static(path.resolve(process.cwd(), 'i18n')));

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
