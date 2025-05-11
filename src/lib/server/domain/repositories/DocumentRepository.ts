import {
  type DocumentId,
  type DocumentEntity,
  type VersionEntry,
} from "$lib/server/domain/entities/DocumentEntity";

// Interface defining operations for documents
export default interface DocumentRepository {
  // Core CRUD operations
  createDocument(): DocumentId;
  updateDocument(docId: DocumentId, document: DocumentEntity): void;
  deleteDocument(docId: DocumentId): DocumentId;
  undo(docId: DocumentId): DocumentEntity | undefined;
  redo(docId: DocumentId): DocumentEntity | undefined;

  getDocument(docId: DocumentId): DocumentEntity | undefined;
  getAllDocuments(): DocumentId[];
  getVersionHistory(docId: DocumentId): VersionEntry[];
  jump(docId: DocumentId, versionIndex: number): DocumentEntity | undefined;
}
