import * as path from 'path';
import * as vscode from 'vscode';

import { ServerOptions, TransportKind, LanguageClient, LanguageClientOptions } from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {

	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	let serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: [{
			scheme: 'file',
			language: '*'
		}],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	client.start();
}


export function deactivate() {
	return client ? client.stop() : undefined;
}
