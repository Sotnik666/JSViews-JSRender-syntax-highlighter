import { createConnection, ProposedFeatures, TextDocuments, InitializeParams, DidChangeConfigurationNotification, Diagnostic, DiagnosticSeverity, TextDocument, TextDocumentPositionParams, CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import has = require('lodash/has');
import JsRenderScriptTypeCompletion from "./completions/jsrenderScriptType";
import IFExpressionCompletion from './completions/ifExpression';

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    let capabilites = params.capabilities;

	hasConfigurationCapability = has(capabilites, 'workspace.configuration');
	
    hasWorkspaceFolderCapability = has(capabilites, 'workspace.workspaceFolders');

    hasDiagnosticRelatedInformationCapability = has(capabilites, 'textDocument.publishDiagnostics.relatedInformation');

    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

connection.onInitialized(() => {
    if(hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if(hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change eventrr received.');
        });
    }
});

interface ExampleSettings {
    maxNumberOfProblems: number;
}

const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
    if(hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <ExampleSettings>(
            (change.settings.languageServerExample || defaultSettings)
        );
    }

    documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	let settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	let text = textDocument.getText();
	let pattern = /\b[A-Z]{2,}\b/g;
	let m: RegExpExecArray | null;

	let problems = 0;
	let diagnostics: Diagnostic[] = [];
	// while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
	// 	problems++;
	// 	let diagnostic: Diagnostic = {
	// 		severity: DiagnosticSeverity.Warning,
	// 		range: {
	// 			start: textDocument.positionAt(m.index),
	// 			end: textDocument.positionAt(m.index + m[0].length)
	// 		},
	// 		message: `${m[0]} is all uppercase.`,
	// 		source: 'ex'
	// 	};
	// 	// if (hasDiagnosticRelatedInformationCapability) {
	// 	// 	diagnostic.relatedInformation = [
	// 	// 		{
	// 	// 			location: {
	// 	// 				uri: textDocument.uri,
	// 	// 				range: Object.assign({}, diagnostic.range)
	// 	// 			},
	// 	// 			message: 'Spelling matters'
	// 	// 		},
	// 	// 		{
	// 	// 			location: {
	// 	// 				uri: textDocument.uri,
	// 	// 				range: Object.assign({}, diagnostic.range)
	// 	// 			},
	// 	// 			message: 'Particularly for names'
	// 	// 		}
	// 	// 	];
	// 	// }
	// 	diagnostics.push(diagnostic);
	// }

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

const completions = [
	new IFExpressionCompletion(connection),
	new JsRenderScriptTypeCompletion(connection)
];

const languageIdList = ['html'];

connection.onCompletion(
	(params: TextDocumentPositionParams): CompletionItem[] => {
		console.log(completions);
		const doc = documents.get(params.textDocument.uri)!;
		if(!doc || languageIdList.indexOf(doc.languageId) === -1) {
			return [];
		}
		let result: CompletionItem[] = [];
		for(const v of completions) {
			result = result.concat(v.onCompletion(doc, params.position) || []);
		}
		return result;
	}
);

connection.onCompletionResolve((item: CompletionItem): CompletionItem => item);

documents.listen(connection);

connection.listen();