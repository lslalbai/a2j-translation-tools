/*
 * Usage: <tool> InterviewDir TranslationDir
 * 
 * If InterviewDir === "" then InterviewDir = "."
 * 
 * README REMEMBER CAUTION
 *
 * The InterviewDir is EDITED IN PLACE.
 * START WITH A COPY OF THE ORIGINAL INTERVIEW.
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

// Now process the translations directory for this language
// to see what texts have already been translated. When that's
// done, emit the resulting doc.
const trTools = require ("./lib/trTools");
trTools.process(TranslationsDir, (trText) => { 
	// Okay, we've got the already existing translations.
	// Take the translations text and generate the relevant
	// interview IN PLACE.
	const ivTools = require ("./lib/ivTools");
	ivTools.translateInPlace(InterviewDir, trText);
});