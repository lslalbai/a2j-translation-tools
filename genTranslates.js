/*
 * Usage: <tool> InterviewDir TranslationDir
 * 
 * If InterviewDir === "" then InterviewDir = "."
 */
TranslationsDir = null;
if (process.argv.length < 3) {
	InterviewDir = ".";
}
if (process.argv.length > 2) {
	InterviewDir = process.argv[2];
}
if (process.argv.length > 3) {
	TranslationsDir = process.argv[3];
}

const ivTools = require ("./lib/ivTools");
const ivText = ivTools.process(InterviewDir);
const trTools = require ("./lib/trTools");
trText = {};
trTools.process(TranslationsDir, (data) => { 
	trText = data; 
	const wordTools = require ("./lib/wordTools");

	// Okay now we need to know if we're emitting a translation doc 
	// or a translated interview.

	// If we're emitting a translation doc: 
	const ms = require ("memory-streams");
	ws = new ms.WritableStream();
	wordTools.emitTranslationDoc(ivText, trText, ws);
	ws.end();

	console.log(ws.toString());
});