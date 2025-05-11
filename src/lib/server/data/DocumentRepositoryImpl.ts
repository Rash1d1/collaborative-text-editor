import {
  type DocumentEntity,
  type DocumentId,
  type VersionEntry,
  type versionIndex,
} from "$lib/server/domain/entities/DocumentEntity";
import type DocumentRepository from "$lib/server/domain/repositories/DocumentRepository";

// Implementation of the Document Repo functionality
export default class DocumentRepositoryImpl implements DocumentRepository {
  private id = 0; // Simple counter-based ID generation
  private documents = new Map<string, DocumentEntity>(); // In-memory document storage (on RAM of localhost)
  private readonly ERROR_DOC_ID: DocumentId = { id: "doc-errorId" }; // Uniform type of non-existent/error document

  createDocument(): DocumentId {
    // Generate sequential document IDs
    const docId: DocumentId = {
      id: `doc-${(this.id++).toString()}`,
    };
    // Initialize document with empty content and version history
    const newDoc: DocumentEntity = {
      id: docId,
      content: "",
      timestamp: new Date(),
      versionHistory: [],
      currentVersionIndex: 0,
    };
    // Add document to the history
    this.documents.set(docId.id, newDoc);
    return docId;
  }

  getDocument(docId: DocumentId): DocumentEntity | undefined {
    const document = this.documents.get(docId.id);

    // if there is no corresponding document
    if (document === undefined) {
      return undefined;
    }
    return {
      ...document,
      timestamp: new Date(document.timestamp),
    };
  }

  updateDocument(docId: DocumentId, document: DocumentEntity): void {
    const existingDoc = this.documents.get(docId.id);

    if (!existingDoc) {
      throw new Error(`Document with id ${docId.id} not found`);
    }

    // Maintain version history when content changes
    if (document.content !== existingDoc.content) {
      // Trim history beyond current version before adding new entry
      existingDoc.versionHistory = existingDoc.versionHistory.slice(
        0,
        existingDoc.currentVersionIndex + 1,
      );
      document.versionHistory = existingDoc.versionHistory.slice(
        0,
        document.currentVersionIndex + 1,
      );
      // Add new version entry to history
      existingDoc.versionHistory.push({
        content: document.content,
        timestamp: document.timestamp,
        versionIndex: existingDoc.versionHistory.length - 1, // Maintain 0-based index
      });
      document.versionHistory.push({
        content: document.content,
        timestamp: document.timestamp,
        versionIndex: document.versionHistory.length - 1,
      });
      document.currentVersionIndex = existingDoc.versionHistory.length - 1;
    }

    this.documents.set(docId.id, {
      ...document,
      timestamp: new Date(),
      versionHistory: existingDoc.versionHistory,
    });
  }

  deleteDocument(docId: DocumentId): DocumentId {
    const exists = this.documents.delete(docId.id);
    return exists ? docId : this.ERROR_DOC_ID;
  }

  undo(docId: DocumentId): DocumentEntity | undefined {
    const document = this.documents.get(docId.id);
    if (!document) {
      return undefined;
    }

    if (document.currentVersionIndex <= -1) {
      throw new Error(
        `Current version, ${document.currentVersionIndex.toString()} index is wrong`,
      );
    }

    const newIndex = document.currentVersionIndex - 1;
    // Handle edge case for empty document history
    const newContent =
      newIndex >= 0 ? document.versionHistory[newIndex].content : "";
    const updatedDocument: DocumentEntity = {
      ...document,
      content: newContent,
      timestamp: new Date(),
      versionHistory: document.versionHistory,
      currentVersionIndex: newIndex,
    };
    this.documents.set(docId.id, updatedDocument);
    return updatedDocument;
  }

  redo(docId: DocumentId): DocumentEntity | undefined {
    const document = this.documents.get(docId.id);
    if (!document) {
      return undefined;
    }

    if (document.currentVersionIndex >= document.versionHistory.length - 1) {
      throw new Error(
        `Current version, ${document.currentVersionIndex.toString()} index is wrong`,
      );
    }

    const newIndex = document.currentVersionIndex + 1;
    const newContent = document.versionHistory[newIndex].content;
    const updatedDocument: DocumentEntity = {
      ...document,
      content: newContent,
      timestamp: new Date(),
      versionHistory: document.versionHistory,
      currentVersionIndex: newIndex,
    };
    this.documents.set(docId.id, updatedDocument);
    return updatedDocument;
  }

  getAllDocuments(): DocumentId[] {
    const documentIds: DocumentId[] = [];
    this.documents.forEach((value: DocumentEntity, key: string) => {
      documentIds.push({ id: key });
    });

    return documentIds;
  }

  jump(docId: DocumentId, verIndex: versionIndex): DocumentEntity | undefined {
    const document = this.documents.get(docId.id);
    verIndex += 1; // Adjust for client-side 0-index vs server-side 1-index
    if (
      !document ||
      verIndex < 0 ||
      verIndex >= document.versionHistory.length
    ) {
      return undefined;
    }

    const newContent = document.versionHistory[verIndex].content;
    const updatedDocument: DocumentEntity = {
      ...document,
      content: newContent,
      timestamp: new Date(),
      versionHistory: document.versionHistory,
      currentVersionIndex: verIndex,
    };
    this.documents.set(docId.id, updatedDocument);
    return updatedDocument;
  }

  getVersionHistory(docId: DocumentId): VersionEntry[] {
    const document = this.documents.get(docId.id);
    if (!document) {
      throw new Error(`Document with id ${docId.id.toString()} not found`);
    }
    return document.versionHistory;
  }
}
