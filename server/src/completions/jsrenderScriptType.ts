import { ICompletioner } from './completer';
import { CompletionItemKind, TextDocument, Position, CompletionItem, Connection } from 'vscode-languageserver';
import { convertEnter } from '../utils/utils';
import * as _ from 'lodash';

export default class JsRenderScriptTypeCompletion extends ICompletioner {

	private readonly leftRegex = /.*<script.*type=\".*/;
	private readonly leftTextRegex = /.*<script.*type=\"text\//;
	private readonly rightRegex = /.*\".*/;

	constructor(connection: Connection) {
		super(connection);
	}

	onCompletion(document: TextDocument, position: Position): CompletionItem[] {
		const text = convertEnter(document.getText());
		if (_.isEmpty(text)) {
			return [];
		}
		const current = text[position.line];
		const left = current.slice(0, position.character);
		const right = current.substring(position.character);
		if (this.rightRegex.test(right)) {
			if(this.leftTextRegex.test(left)) {
				return [
					{
						label: 'x-jsrender',
						detail: 'jsviews',
						documentation: 'jsviews template identifier',
						kind: CompletionItemKind.Value
					}
				];
			}
			if (this.leftRegex.test(left)) {
				return [
					{
						label: 'text/x-jsrender',
						detail: 'jsviews',
						documentation: 'jsviews template identifier',
						kind: CompletionItemKind.Value
					}
				];
			}
		}
		return [];
	}

}