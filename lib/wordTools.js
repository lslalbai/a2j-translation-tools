exports.emitTranslationDoc = function (ivArr, trArr, wStream) {
	wStream.write("<html xmlns='http://www.w3.org/TR/REC-html40'>\n");
	wStream.write("<head>\n");
	wStream.write("<meta charset='utf-8'><title>Export HTML To Doc</title>\n");
	wStream.write("<style>" +
	"@page MSWordLandscape " +
	"        {size:11.0in 8.5in;" +
	"        mso-page-orientation:landscape;" +
	"        margin:.5in .5in .5in .5in;" +
	"        mso-header-margin:.5in;" +
	"        mso-footer-margin:.5in;" +
	"        mso-paper-source:0;}" +
	"div.MSWordLandscape { page:MSWordLandscape; }" +
	"</style>\n");
	wStream.write("</head>\n");
	wStream.write("<body>\n");
	wStream.write("<div class='MSWordLandscape'>\n");
	wStream.write("<TABLE border='1'>\n");
	wStream.write("<THEAD>\n");
	wStream.write("<TH>English Text</TH><TH>Translation</TH>\n");
	wStream.write("</THEAD>\n");
	wStream.write("<TBODY>\n");
	for (const [ivKey, ivTxt] of Object.entries(ivArr)) {
		// Don't include the text if it's already been translated:
		if (undefined === trArr[ivKey])
			wStream.write("<TR><TD width='50%'>"+ivTxt+"</TD><TD width='50%'>&nbsp;</TD></TR>\n");
	}
	wStream.write("</TBODY>\n");
	wStream.write("</TABLE>\n");
	wStream.write("</div>\n");
	wStream.write("</body>\n</html>\n");
};

const ivTools = require ("./ivTools");
const hp2 = require ("htmlparser2");
const ms = require ("memory-streams");

exports.parseDoc = function (stream, trArr, endingCallback) {
	parser = new hp2.Parser({
		inTrTableDiv: false,
		inTrTable: false,
		inTrBody: false,
		inDocFrag: false,
		inList: [],
		inStream: null,
		trCell: 0,
		trKey: -1,
		
		onopentag(name, atts) {
			if ("div" === name && "MSWordLandscape" === atts["class"]) {
				// We are in the main div, look for TABLE
				this.inTrTableDiv = true;
			}
			
			if (this.inDocFrag) {
				// We are in a TD processing its contents.
				// This is not a strict block - DocumentFragment instead.
				this.inList.push(name);
				// emit the open tag and its attrs:
				this.inStream.write("<"+name);
				for (att in atts) this.inStream.write(" "+att+"='"+atts[att]+"'");
				this.inStream.write(">");
			} else {
				// Get into the TD so we can start processing its guts.
				if ("table" === name && this.inTrTableDiv)
					this.inTrTable = true;
				
				if ("tbody" === name && this.inTrTable)
					this.inTrBody = true;
				
				if ("tr" === name && this.inTrBody)
					this.trCell = 0; // Increment with each new TD
				
				if ("td" === name && this.inTrBody) {
					this.trCell++;
					this.inDocFrag = true;
					this.inStream = new ms.WritableStream();
					this.inList = [];
				}
			}
		},
		ontext(text) {
			if (this.inDocFrag) {
				// If we're inside the DocumentFragment then store the text.
				this.inStream.write(text);
			}
		},
		onclosetag(name) {
			// We get out when we see the closing </td> around the DocumentFragment:
			if (this.inDocFrag && "td" === name && 0 === this.inList.length) {
				this.inDocFrag = false;
				this.inStream.end();
				text = this.inStream.toString();
				this.inStream = null;
			}

			// If we're still in, pop the tag and make sure we saw it going in.
			if (this.inDocFrag && this.inList.length > 0) {
				if (name !== this.inList.pop()) 
					console.error("whoa unexpected closetag '"+name+"'");
				this.inStream.write("</"+name+">");
			} else {
				// Otherwise if this is the </TD> then let's process the DocumentFragment
				if ("td" === name && this.inTrBody) {
					if (1 === this.trCell) {
						// This is SOURCE TEXT. Compute hash and store source:
						this.trKey = ivTools.computeHash(text);
						if (undefined === trArr[this.trKey]) {
							trArr[this.trKey] = { "source": text };
						} else {
						    if (text !== trArr[this.trKey]["source"]) {
						    	console.error("ERROR: haven't implemented hash collisions yet.");
						    } else {
						    	// This should never happen.
						    	console.warn("OK Collision on '"+this.trKey+"'");
						    }
						}				
					}
					if (2 === this.trCell) {
						// FIXME: for now, assume no collision in step one.
						trArr[this.trKey]["translation"] = text;
					}
				}
				
				if ("tr" === name && this.inTrBody)
					this.trCell = 0; // Increment with each new TD
				
				if ("tbody" === name && this.inTrTable)
					this.inTrBody = false;
				
				if ("table" === name && this.inTrTableDiv)
					this.inTrTable = false;
				
				if (this.inTrTableDiv && "div" === name)
					this.inTrTableDiv = false;
			}
		},
		
		onend() { /* we're done! */ endingCallback(); }
	},
	{
		decodeEntities: true
	});
	stream.on('close', () => { parser.end(); });
	stream.on('data', (chunk) => {
		parser.write(chunk);
	});
};
