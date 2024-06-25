import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

class CompletionBuilder {

    private _label: string = '';
    private _kind: CompletionItemKind = CompletionItemKind.Keyword;
    private _insertText: string = '';

    public label(value: string): CompletionBuilder {
        this._label = value;
        return this;
    }

    public kind(value: CompletionItemKind): CompletionBuilder {
        this._kind = value;
        return this;
    }

    public insertText(value: string): CompletionBuilder {
        this._insertText = value;
        return this;
    }

    public build(): CompletionItem {
        return {
            label: this._label,
            kind: this._kind,
            insertText: this._insertText
        };
    }
}

export function completion(label: string): CompletionBuilder {
    return (new CompletionBuilder()).label(label);
}