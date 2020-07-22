const wTools = require ("./wordTools");
const fs = require ("fs");

exports.process = function (trDirName, cb) {
	const trArr = {};
	if (null === trDirName) { cb(trArr); return; }
	
	const trDir = fs.opendirSync(trDirName);	
	function processFile(err, ent) {
		if (err) { throw err; }
		else {
			if (null === ent) { cb(trArr); return; }
			
			if (ent.isFile()) {
			    if (ent.name.endsWith(".html")) {
			    	stream = fs.createReadStream(trDirName + "/"+ ent.name);
			    	wTools.parseDoc(stream, trArr, () => { trDir.read(processFile); });
			    } else {
			    	// !ent.endsWith(.html)
			    	trDir.read(processFile);
			    }
			} else {
				// !ent.isFile()
				trDir.read(processFile);
			}
		}
	}

	trDir.read(processFile);
}