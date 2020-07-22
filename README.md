# Workflow
## Initial use
For the initial use, we assume there have been no previous translations.

**Inputs: source/English interview**

Tool takes a source/English interview, traverses the component files to extract unique text/HTML blocks, and generates a translation document.

**Output: translation document**

The translation document is an MS Word compatible HTML file with a single <TABLE>. Each row has two cells; on the left is the text/HTML block to be translated, and on the right is an empty cell. Translator should be able to take this document and translate the text into the right-hand column.

## Doing the translation
Translator takes the translation document and puts formatted, translated text in a single destination language into the right hand column.
Once the translation document is completed, it is placed into a folder/directory that holds all translation documents for that destination language.
For example: all Spanish translations will be in their own directory, separate from the Vietnamese translations, which are themselves in their own different directory.

## Making translated interview
In this step we take the existing translation documents, a source interview, and generate a translated interview.

**Inputs: source/English interview, translation document directory**

**Output: translated interview**

The tool processes all the translation documents in the translation document directory, creating a map of {source, destination} translated text blocks.

The tool traverses the source interview to identify each source text block. The source text block is looked up in the map and the destination translated text block is substituted.

When all the source text blocks have been translated, the tool generates a new translated interview.

## Update the source/English interview
In this step, the A2J programmer(s) make changes to the source/English interview. It is assumed that in this version new text blocks will be created which will need to be translated.

Sometimes the “new” text block is a modification, no matter how small, of an existing text block. A modification can be as small as a change in the font, size, or weight, and not involve any changes to what we would consider the readable text.

The tool cannot tell the difference; the match is made on the whole HTML representation of the text if it is rich text. 
Perhaps a later iteration of the tool can be more sophisticated and work at the element level (e.g., DIV, SPAN, P) of the rich text instead of the whole block.

## Generating new translation file
**Inputs: updated source/English interview, destination translation document directory**

**Output: translation document**

The tool processes all the translation documents in the translation document directory, creating a map of {source, destination} translated text blocks.
The tool traverses the source interview to identify each source text block. The source text block is looked up in the map and if it is NOT found in the map, is emitted to a new translation document. This means text blocks that have already been translated don’t have to be translated again.
The translation document is an MS Word compatible HTML file with a single TABLE element. Each row has two cells; on the left is the text/HTML block to be translated, and on the right is an empty cell. Translator should be able to take this document and translate the text into the right-hand column.

Alert readers will note that this is essentially the same job as the initial step (Initial use). The initial step can be implemented as a special case of this step, given a null <destination translation document directory>.

