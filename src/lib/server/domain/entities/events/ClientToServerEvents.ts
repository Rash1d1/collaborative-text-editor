import {
  type DocumentContent,
  type DocumentId,
} from "$lib/server/domain/entities/DocumentEntity";

// Defines client-initiated socket events
export interface ClientToServerEvents {
  enterDocument: (docId: DocumentId) => void; // Join document collaboration
  exitDocument: (docId: DocumentId) => void; // Leave document collaboration
  updateDocument: (docId: DocumentId, newContent: DocumentContent) => void;
  createDocument: () => void;
  deleteDocument: (docId: DocumentId) => void;
  undo: (docId: DocumentId) => void;
  redo: (docId: DocumentId) => void;
  getAllDocuments: () => void;
  getDocument: (docId: DocumentId) => void;
  jump: (docId: DocumentId, versionIndex: number) => void; // "Jump" across version history of document
}
