import { io, type Socket } from "socket.io-client";

import type { DocumentId } from "$lib/server/domain/entities/DocumentEntity";
import type { ClientToServerEvents } from "$lib/server/domain/entities/events/ClientToServerEvents";
import type { ServerToClientEvents } from "$lib/server/domain/entities/events/ServerToClientEvents";
import type { Message } from "$lib/server/domain/repositories/SocketRepository";
import type { ResponseMessage } from "$lib/server/domain/entities/ResponseMessage";
import type { versionIndex } from "$lib/server/domain/entities/DocumentEntity";

// Using Map with UUID keys to handle multiple subscribers and allow clean cleanup
type OnMessageCallback = (message: ResponseMessage) => void;
type GetAllDocumentsCallback = (documentIds: DocumentId[]) => void;

class ClientApi {
  private io: Socket<ServerToClientEvents, ClientToServerEvents>;

  private onMessageCallbacks = new Map<string, OnMessageCallback>();
  private getAllDocumentsCallbacks = new Map<string, GetAllDocumentsCallback>();

  constructor(serverUrl: string) {
    this.io = io(serverUrl, {
      autoConnect: true, // Automatically establish connection on creation
      reconnection: true, // Enable automatic reconnection attempts
      transports: ["websocket"], // Force WebSocket transport only
    });
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    // Central handler for real-time document updates
    this.io.on("sendUpdateMessage", (document) => {
      this.onMessageCallbacks.forEach((callback) => {
        callback(document);
      });
    });
    // Handler for initial document list "files"
    this.io.on("sendDocumentIds", (documentIds) => {
      this.getAllDocumentsCallbacks.forEach((callback) => {
        callback(documentIds);
      });
    });
    // Handler for document loading by the front end needs
    this.io.on("sendDocument", (document) => {
      this.onMessageCallbacks.forEach((callback) => {
        callback(document);
      });
    });
    // Error handling for connection issues
    this.io.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });
  }

  public enterDocument(docId: DocumentId): void {
    this.io.emit("enterDocument", docId);
  }

  public exitDocument(docId: DocumentId): void {
    this.io.emit("exitDocument", docId);
  }

  public updateDocument(docId: DocumentId, newContent: Message): void {
    this.io.emit("updateDocument", docId, newContent);
  }

  public createDocument(): void {
    this.io.emit("createDocument");
  }

  public deleteDocument(docId: DocumentId): void {
    this.io.emit("deleteDocument", docId);
  }

  public undo(docId: DocumentId): void {
    this.io.emit("undo", docId);
  }

  public redo(docId: DocumentId): void {
    this.io.emit("redo", docId);
  }

  public getAllDocuments(): void {
    this.io.emit("getAllDocuments");
  }

  public getDocument(docId: DocumentId): void {
    this.io.emit("getDocument", docId);
  }

  public jump(docId: DocumentId, verIndex: versionIndex): void {
    this.io.emit("jump", docId, verIndex);
  }

  public onGetAllDocuments(callback: GetAllDocumentsCallback): () => void {
    const callbackId = crypto.randomUUID(); // Unique ID for safe callback management
    this.getAllDocumentsCallbacks.set(callbackId, callback);

    // Return cleanup function to prevent memory leaks
    return () => {
      this.getAllDocumentsCallbacks.delete(callbackId);
    };
  }

  public onMessage(callback: OnMessageCallback): () => void {
    const callbackId = crypto.randomUUID(); // Unique ID for safe callback management
    this.onMessageCallbacks.set(callbackId, callback);

    // Allows components to unsubscribe from updates when unmounted
    return () => {
      this.onMessageCallbacks.delete(callbackId);
    };
  }
}

// Svelte's $state for reactive store management
export const api = $state(new ClientApi("http://localhost:8952/"));

// Reactive document list synchronized with server state
export const documentIds = $state({ value: [] as DocumentId[] });
api.onGetAllDocuments((newDocumentIds) => {
  documentIds.value = newDocumentIds; // Update state when server sends new list
});
