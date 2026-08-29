import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger";

let io: Server;

export function initSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "Client connected");

    socket.on("join:wari", (wariId: string) => {
      socket.join(`wari:${wariId}`);
      logger.debug({ socketId: socket.id, wariId }, "Joined wari room");
    });

    socket.on("leave:wari", (wariId: string) => {
      socket.leave(`wari:${wariId}`);
    });

    socket.on("join:region", (regionId: string) => {
      socket.join(`region:${regionId}`);
      logger.debug({ socketId: socket.id, regionId }, "Joined region room");
    });

    socket.on("leave:region", (regionId: string) => {
      socket.leave(`region:${regionId}`);
    });

    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id }, "Client disconnected");
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

export function emitToWari(wariId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`wari:${wariId}`).emit(event, data);
  }
}

export function emitToRegion(regionId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`region:${regionId}`).emit(event, data);
  }
}

export function broadcastLocationUpdate(data: unknown): void {
  if (io) {
    io.emit("location:update", data);
  }
}

export function broadcastAlert(data: unknown): void {
  if (io) {
    io.emit("alert:new", data);
  }
}
