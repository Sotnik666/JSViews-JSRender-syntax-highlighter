import { TextDocument, Position, CompletionItem, Connection } from 'vscode-languageserver';

export abstract class ICompletioner {

	protected readonly _connection: Connection;

	constructor(connection: Connection) {
		this._connection = connection;
	}

	abstract onCompletion(document: TextDocument, position: Position): CompletionItem[];

	log(msg: any) {
		this._connection.console.log('' + msg);
	}
}
