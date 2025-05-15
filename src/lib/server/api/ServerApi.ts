import express, { type Express } from "express";
import { createServer, type Server as HttpServer } from "http";
import { Server as IoServer } from "socket.io";

import DocumentRepositoryImpl from "$lib/server/data/DocumentRepositoryImpl";
import SocketRepositoryImpl from "$lib/server/data/SocketRepositoryImpl";
import { type ClientToServerEvents } from "$lib/server/domain/entities/events/ClientToServerEvents";
import { type ServerToClientEvents } from "$lib/server/domain/entities/events/ServerToClientEvents";
import { type SocketClient } from "$lib/server/domain/entities/SocketClient";
import { type SubscriberData } from "$lib/server/domain/entities/SubscriberData";
import type DocumentRepository from "$lib/server/domain/repositories/DocumentRepository";
import type SocketRepository from "$lib/server/domain/repositories/SocketRepository";
import UseCaseContainer from "$lib/server/domain/UseCaseContainer";
import client from "prom-client";
import http from "http";

client.collectDefaultMetrics();

// Use the default global registry
const register = client.register;

const currentConnectedClients = new client.Gauge({
  name: "socketio_current_connected_clients",
  help: "Current number of connected Socket.IO clients",
  labelNames: [],
});

// New custom metrics
const documentUpdates = new client.Counter({
  name: "document_updates_total",
  help: "Total number of document updates",
  labelNames: ["docId"],
});

const documentActions = new client.Counter({
  name: "document_actions_total",
  help: "Total number of document actions (create, delete, undo, redo)",
  labelNames: ["action"],
});

export default class ServerApi {
  app: Express;
  server: HttpServer;
  io: IoServer<
    ClientToServerEvents,
    ServerToClientEvents,
    never,
    SubscriberData
  >;
  connectedClientCount: number = 0;

  documentRepo: DocumentRepository;
  socketRepo: SocketRepository;
  useCaseContainer: UseCaseContainer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new IoServer<
      ClientToServerEvents,
      ServerToClientEvents,
      never,
      SubscriberData
    >(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.documentRepo = new DocumentRepositoryImpl();
    this.socketRepo = new SocketRepositoryImpl(this.io);
    this.useCaseContainer = new UseCaseContainer(
      this.documentRepo,
      this.socketRepo,
    );
    this.setupSocketHandlers();

    // Metrics endpoint
    this.app.get("/metrics", async (req, res) => {
      try {
        res.setHeader("Content-Type", register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
      } catch (err) {
        console.error("Error generating metrics:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket: SocketClient) => {
      console.log(`Client connected: ${socket.id}`);

      this.connectedClientCount++;
      currentConnectedClients.set(this.connectedClientCount);

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClientCount--;
        currentConnectedClients.set(this.connectedClientCount);
      });

      socket.on("enterDocument", async (docId) => {
        await this.useCaseContainer.enterDocument.invoke(socket, docId);
        console.log(`Client [${socket.id}] enters room ${docId.id}`);
      });

      socket.on("exitDocument", async (docId) => {
        await this.useCaseContainer.exitDocument.invoke(socket, docId);
        console.log(`Client [${socket.id}] exits room ${docId.id}`);
      });

      socket.on("disconnect", async () => {
        if (socket.data.docId !== undefined) {
          await this.useCaseContainer.exitDocument.invoke(
            socket,
            socket.data.docId,
          );
        }
      });

      socket.on("updateDocument", (docId, newContent) => {
        this.useCaseContainer.updateDocument.invoke(docId, newContent);
        console.log(
          `Client [${socket.id}] updated document: ${docId.id} with new content: ${newContent}`,
        );
        documentUpdates.inc({ docId: docId.id.toString() }); // Track updates per document
      });

      socket.on("createDocument", () => {
        this.useCaseContainer.createDocument.invoke();
        documentActions.inc({ action: "create" });
      });

      socket.on("deleteDocument", (docId) => {
        this.useCaseContainer.deleteDocument.invoke(docId);
        documentActions.inc({ action: "delete" });
      });

      socket.on("undo", (docId) => {
        this.useCaseContainer.undoDocument.invoke(docId);
        documentActions.inc({ action: "undo" });
      });

      socket.on("redo", (docId) => {
        this.useCaseContainer.redoDocument.invoke(docId);
        documentActions.inc({ action: "redo" });
      });

      socket.on("getAllDocuments", () => {
        this.useCaseContainer.getAllDocuments.invoke(socket);
      });

      socket.on("getDocument", (docId) => {
        this.useCaseContainer.getDocument.invoke(socket, docId);
      });

      socket.on("jump", (docId, versionIndex) => {
        this.useCaseContainer.jumpDocument.invoke(docId, versionIndex);
      });
    });
  }

  start(port: number) {
    this.server.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  }
}
