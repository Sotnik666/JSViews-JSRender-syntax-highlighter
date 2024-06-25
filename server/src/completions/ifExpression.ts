import { ICompletioner } from './completer';
import { CompletionItemKind, TextDocument, Position, CompletionItem, Connection } from 'vscode-languageserver';
import { convertEnter, hasInScript } from '../utils/utils';

export default class IFExpressionCompletion extends ICompletioner {
	
	constructor(connection: Connection) {
		super(connection);
	}

	onCompletion(document: TextDocument, position: Position): CompletionItem[] {
		const text = convertEnter(document.getText());
		if(hasInScript(text, position.line)) {
			return [
				{
					label: 'if ',
					kind: CompletionItemKind.Keyword
				}
			];
		}
		return [];
	}

}