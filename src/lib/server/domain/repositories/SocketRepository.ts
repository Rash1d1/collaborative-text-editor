import {
  type DocumentId,
  type VersionEntry,
} from "$lib/server/domain/entities/DocumentEntity";
import { type SocketClient } from "$lib/server/domain/entities/SocketClient";
import type { ResponseMessage } from "../entities/ResponseMessage";

export type Message = string;

// Interface defining real-time communication operations
export default interface SocketRepository {
  // Broadcast message to all clients in a document room
  broadcast(docId: DocumentId, message: ResponseMessage): void;

  registerClient(client: SocketClient, docId: DocumentId): Promise<void>;
  unregisterClient(client: SocketClient, docId: DocumentId): Promise<void>;
  sendAllDocuments(client: SocketClient, documentIds: DocumentId[]): void;
  sendDocument(client: SocketClient, documentContent: ResponseMessage): void;
  sendVersionHistory(
    clinet: SocketClient,
    versionHistory: VersionEntry[],
  ): void;
}
