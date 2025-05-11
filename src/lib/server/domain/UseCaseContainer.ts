import type DocumentRepository from "./repositories/DocumentRepository";
import type SocketRepository from "./repositories/SocketRepository";
import CreateDocumentUseCase from "./usecases/CreateDocumentUseCase";
import DeleteDocumentUseCase from "./usecases/DeleteDocumentUseCase";
import EnterDocumentUseCase from "./usecases/EnterDocumentUseCase";
import ExitDocumentUseCase from "./usecases/ExitDocumentUseCase";
import UpdateDocumentUseCase from "./usecases/UpdateDocumentUseCase";
import UndoDocumentUseCase from "./usecases/UndoDocumentUsaCase";
import RedoDocumentUseCase from "./usecases/RedoDocumentUseCase";
import GetDocumentUseCase from "./usecases/GetDocumentUseCase";
import GetAllDocumentsUseCase from "./usecases/GetAllDocumentsUseCase";
import JumpDocumentUseCase from "./usecases/JumpDocumentUseCase";

// Centralized access point for all use cases
export default class UseCaseContainer {
  createDocument: CreateDocumentUseCase;
  deleteDocument: DeleteDocumentUseCase;
  enterDocument: EnterDocumentUseCase;
  exitDocument: ExitDocumentUseCase;
  updateDocument: UpdateDocumentUseCase;
  undoDocument: UndoDocumentUseCase;
  redoDocument: RedoDocumentUseCase;
  getDocument: GetDocumentUseCase;
  getAllDocuments: GetAllDocumentsUseCase;
  jumpDocument: JumpDocumentUseCase;

  constructor(
    private documentRepo: DocumentRepository,
    private socketRepo: SocketRepository,
  ) {
    // Initialize all use cases with shared repository dependencies
    this.enterDocument = new EnterDocumentUseCase(socketRepo);
    this.createDocument = new CreateDocumentUseCase(documentRepo);
    this.deleteDocument = new DeleteDocumentUseCase(documentRepo);
    this.exitDocument = new ExitDocumentUseCase(socketRepo);
    this.updateDocument = new UpdateDocumentUseCase(documentRepo, socketRepo);
    this.undoDocument = new UndoDocumentUseCase(documentRepo, socketRepo);
    this.redoDocument = new RedoDocumentUseCase(documentRepo, socketRepo);
    this.getDocument = new GetDocumentUseCase(documentRepo, socketRepo);
    this.getAllDocuments = new GetAllDocumentsUseCase(documentRepo, socketRepo);
    this.jumpDocument = new JumpDocumentUseCase(documentRepo, socketRepo);
  }
}
