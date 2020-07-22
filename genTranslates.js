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

// Find all the text in the interview. We'll compare this 
// against the translation directory to filter out texts
// that have already been translated into that language:
const ivTools = require ("./lib/ivTools");
const ivText = ivTools.process(InterviewDir);

// Now process the translations directory for this language
// to see what texts have already been translated. When that's
// done, emit the resulting doc.
const trTools = require ("./lib/trTools");
trTools.process(TranslationsDir, (trText) => { 
	// Okay, we've got the already existing translations.
	// Take the interview text, the translations text,
	// and generate a translation document to the provided
	// WritableStream.
	const wordTools = require ("./lib/wordTools");
	const ms = require ("memory-streams");
	ws = new ms.WritableStream();
	wordTools.emitTranslationDoc(ivText, trText, ws);
	ws.end();

	// I suppose we could save this to a file. Emit to
	// STDOUT for now.
	console.log(ws.toString());
});