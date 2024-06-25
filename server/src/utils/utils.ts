import os = require('os');
import * as _ from 'lodash';

export function convertEnter(originText: string): string[] {
    return originText ? originText.split(os.EOL) : [];
}

const matchScript = /<script.*>/;
const matchScriptType = /(<script.*)(type=")(.*)(")/;
const scriptLeftRegex = /.*<script.*type="text\/x-jsrender".*>.*/;
const scriptRightRegex = /.*<\/script>.*/;

export function hasInScript(texts: string[], index: number): boolean {
	const start = findLatelyStartScript(texts, index);
	const end = findLatelyEndScript(texts, index);
	return scriptLeftRegex.test(start!) && scriptRightRegex.test(end!);
}

function findLatelyStartScript(strs: string[], index: number): string | null {
	const topTexts = strs.slice(0, index);
	for(let i = topTexts.length - 1;i >= 0;i--) {
		const v = topTexts[i];
		if(hasScriptStart(v)) {
			return v;
		}
	}
	return null;
}

function findLatelyEndScript(strs: string[], index: number): string | null {
	const buttomTexts = strs.slice(index, strs.length);
	for(const v of buttomTexts) {
		if(hasScriptEnd(v)) {
			return v;
		}
	}
	return null;
}

function hasScriptStart(scriptStr: string): boolean {
	return matchScript.test(scriptStr);
}

function hasScriptEnd(scriptStr: string): boolean {
	return scriptRightRegex.test(scriptStr);
}

function getScriptType(scriptStr: string): string {
	const result = matchScriptType.exec(scriptStr);
	if(!result) {
		return '';
	}
	return _.get(result, '[3]');
}

export function getStrCount(origin: string, str: string): number {
	return origin.split('').reduce((prev, v) => v === str ? prev + 1 : prev, 0);
}

export function generateStr(str: string, count: number): string {
	let result = '';
	for (let i = 0; i < count; i++) {
		result += str;
	}
	return result;
}