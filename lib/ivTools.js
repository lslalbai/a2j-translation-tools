const fs = require("fs");
const crypto = require('crypto');

function computeHash(text) {
	hash = crypto.createHash('sha256');
	hash.update(text);
	return hash.digest("hex");
}

function addText(text, txtArr) {
	if (text.length == 0) return;

	key = computeHash(text);
	if (undefined === txtArr[key]) {
		txtArr[key] = text;
	} else {
	    if (text !== txtArr[key]) {
	      console.error("ERROR: haven't implemented hash collisions yet.");
	    } else {
	      console.warn("OK Collision on '"+key+"'");
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

// ======================================================
exports.computeHash = computeHash;
exports.process = function (iDirName) {
	idDir = fs.opendirSync(iDirName);
	textArr = {};
	
	while (null != (ent = idDir.readSync())) {
	  if (ent.isFile()) {
	    if (ent.name.endsWith(".json")) {
	      data = JSON.parse(fs.readFileSync(iDirName + "/"+ ent.name));
	      if ("A2J" === data.tool) {
	    	  processGuideChildren(data, textArr);
	      } else {
	        if (true === data.active && "a2j-template" === data.rootNode.tag) {
	        	processTemplateChildren(data.rootNode, textArr);
	        } else {
	        	// Huh. 
	        }
	      }
	    }
	  }
	}
	
	return textArr;
};