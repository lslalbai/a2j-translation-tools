const fs = require("fs");
const crypto = require('crypto');

function computeHash(text) {
	hash = crypto.createHash('sha256');
	hash.update(text);
	return hash.digest("hex");
}
exports.computeHash = computeHash;

// ======================================================
function addText(text, txtArr) {
	if (text.length == 0) return;

	key = computeHash(text);
	if (undefined === txtArr[key]) {
		txtArr[key] = text;
	} else {
		if (text !== txtArr[key]) {
			console.error("ERROR: haven't implemented hash collisions yet.");
		} else {
			console.warn("OK Collision on '" + key + "'");
		}
	}
}

function processTemplateChildren(parent, txtArr) {
	parent["children"].forEach((x, i) => {
		if (undefined !== x.rootNode) processTemplateChildren(x.rootNode, txtArr);
		if (undefined !== x.children) processTemplateChildren(x, txtArr);
		if ("a2j-rich-text" === x.tag) {
			addText(x.state.userContent, txtArr);
		}
	});
}

function processGuideChildren(parent, txtArr) {
	for (pageName in parent.pages) {
		page = parent.pages[pageName];
		page.buttons.forEach((btn, i) => {
			addText(btn.label, txtArr);
		});
		page.fields.forEach((fld, i) => {
			addText(fld.label, txtArr);
		});
		for (x of ["text", "learn", "help"]) {
			if (undefined !== page[x]) addText(page[x], txtArr);
		}
	}
	parent["steps"].forEach((step, i) => {
		addText(step.text, txtArr);
	});
}

exports.process = function(iDirName) {
	ivDir = fs.opendirSync(iDirName);
	ivArr = {};

	while (null != (ent = ivDir.readSync())) {
		if (ent.isFile()) {
			if (ent.name.endsWith(".json")) {
				data = JSON.parse(fs.readFileSync(iDirName + "/" + ent.name));
				if ("A2J" === data.tool) {
					processGuideChildren(data, ivArr);
				} else {
					if (true === data.active && "a2j-template" === data.rootNode.tag) {
						processTemplateChildren(data.rootNode, ivArr);
					} else {
						// Huh. 
					}
				}
			}
		}
	}

	return ivArr;
};

// ======================================================
function subText(text, trArr) {
	if (text.length == 0) return "";

	key = computeHash(text);
	if (undefined === trArr[key]) {
		console.warn("Unable to find translation for '"+text+"'");
		return text;
	} else {
		// Value at hash is { source: "", translation: "" }
		val = trArr[key];
		if (text !== val["source"]) {
			console.error("ERROR: haven't implemented hash collisions yet.");
			return text;
		} else {
			return val["translation"];
		}
	}
}

function translateTemplateChildren(parent, trArr) {
	parent["children"].forEach((x, i) => {
		if (undefined !== x.rootNode) translateTemplateChildren(x.rootNode, trArr);
		if (undefined !== x.children) translateTemplateChildren(x, trArr);
		if ("a2j-rich-text" === x.tag) {
			x.state.userContent = subText(x.state.userContent, trArr);
		}
	});
}

function translateGuideChildren(parent, trArr) {
	for (pageName in parent.pages) {
		page = parent.pages[pageName];
		page.buttons.forEach((btn, i) => {
			btn.label = subText(btn.label, trArr);
		});
		page.fields.forEach((fld, i) => {
			fld.label = subText(fld.label, trArr);
		});
		for (x of ["text", "learn", "help"]) {
			if (undefined !== page[x]) page[x] = subText(page[x], trArr);
		}
	}
	parent["steps"].forEach((step, i) => {
		step.text = subText(step.text, trArr);
	});
}

exports.translateInPlace = function(iDirName, trText) {
	ivDir = fs.opendirSync(iDirName);

	while (null != (ent = ivDir.readSync())) {
		fullName = iDirName + "/" + ent.name;
		if (ent.isFile()) {
			// Process the JSON files:
			if (ent.name.endsWith(".json")) {
				data = JSON.parse(fs.readFileSync(fullName));
				if ("A2J" === data.tool) {
					translateGuideChildren(data, trText);
					fs.writeFileSync(fullName, JSON.stringify(data, null, 1));
				} else {
					if (true === data.active && "a2j-template" === data.rootNode.tag) {
						translateTemplateChildren(data.rootNode, trText);
						fs.writeFileSync(fullName, JSON.stringify(data, null, 1));
					} else {
						// Huh. 
					}
				}
			}
			// TODO: Need to process the Guide.XML file as well
		}

	}
};