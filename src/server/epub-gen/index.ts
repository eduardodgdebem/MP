import JSZip from "jszip";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

export class EpubGenerator {
  private zip: JSZip;
  private imgsBuff: Buffer[] = [];
  private imgsNames: string[];
  private imgSize = {
    width: 1236,
    height: 1648,
  };
  private uuid = randomUUID({ disableEntropyCache: true });

  constructor(
    private title: string,
    private base64Imgs: string[],
    private fileNames: string[],
  ) {
    this.zip = new JSZip();
    this.zip.file("mimetype", "application/epub+zip");
    this.base64Imgs.forEach((base64) => {
      const buff = Buffer.from(base64, "base64");
      this.imgsBuff.push(buff);
    });
    this.imgsNames = this.fileNames.map(
      (fileName) => fileName.split(".")[0]!,
    );
  }

  async generateEpub() {
    await this.addImgsToZip();
    this.generateContainer();
    this.generateContent();
    this.generateNav();
    this.generateToc();
    this.generateText();
    return await this.generateAsync();
  }

  private async generateAsync() {
    const buffer = await this.zip.generateAsync({ type: "arraybuffer" });
    return buffer;
  }

  private async addImgsToZip() {
    const coverBuff = this.imgsBuff[0]!;
    this.zip.file("OEBPS/Images/cover.png", coverBuff);
    for (let i = 0; i < this.imgsBuff.length; i++) {
      const imgBuff = this.imgsBuff[i];
      const fileName = this.fileNames[i];
      const resized = await sharp(imgBuff)
        .resize(this.imgSize.width, this.imgSize.height, { fit: "contain" })
        .toBuffer()
      this.zip.file("OEBPS/Images/" + fileName, resized);
    }
  }

  private generateContainer() {
    const container =
      '<?xml version="1.0"?>' +
      '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
      "  <rootfiles>" +
      '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />' +
      "  </rootfiles>" +
      "</container>";
    this.zip.file("META-INF/container.xml", container);
  }

  private generateContent() {
    let date = new Date().toISOString()
    date = date.slice(0, date.length - 5) + "Z"
    const content = `<?xml version="1.0" encoding="UTF-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/" version="3.0" xml:lang="en"
    unique-identifier="BookID">
					<metadata xmlns:opf="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/">
							<dc:title>${this.title}</dc:title>
							<dc:language>en-US</dc:language>
							<dc:identifier id="BookID">urn:uuid:${this.uuid}</dc:identifier>
							<dc:creator>manga-pup</dc:creator>
              <meta property="dcterms:modified">2012-04-12T12:00:00Z</meta>
							<meta name="cover" content="cover" />
							<meta name="fixed-layout" content="true" />
							<meta name="original-resolution" content="1236x1648" />
							<meta name="book-type" content="comic" />
							<meta name="primary-writing-mode" content="horizontal-rl" />
							<meta name="zero-gutter" content="true" />
							<meta name="zero-margin" content="true" />
							<meta name="ke-border-color" content="#FFFFFF" />
							<meta name="ke-border-width" content="0" />
							<meta property="rendition:spread">landscape</meta>
							<meta property="rendition:layout">pre-paginated</meta>
							<meta name="orientation-lock" content="none" />
							<meta name="region-mag" content="true" />
					</metadata>
					${this.generateManifetst()}
					${this.generateSpine()}
			</package>
		`;

    this.zip.file("OEBPS/content.opf", content);
  }

  private generateManifetst() {
    let manifest = `<manifest>
				<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
				<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml" />
				<item id="cover" href="Images/cover.png" media-type="image/png" properties="cover-image" />
		`;
    for (const imgName of this.imgsNames) {
      manifest += `
				<item id="page_Images_${imgName}" href="Text/${imgName}.xhtml" media-type="application/xhtml+xml" />
				<item id="img_Images_${imgName}" href="Images/${imgName}.png" media-type="image/png" />
			`;
    }
    manifest += `
				<item id="css" href="Text/style.css" media-type="text/css" />
			</manifest>
		`;
    return manifest;
  }

  private generateSpine() {
    let spine = `<spine page-progression-direction="rtl" toc="ncx">`;
    let isRight = true;
    for (const fileName of this.imgsNames) {
      spine += `<itemref idref="page_Images_${fileName}" linear="yes" properties="page-spread-${
        isRight ? `right` : `left`
      }" />`;
      isRight = !isRight;
    }
    spine += `</spine>`;
    return spine;
  }

  private generateToc() {
    const toc = `<?xml version="1.0" encoding="UTF-8"?>
			<ncx version="2005-1" xml:lang="en-US" xmlns="http://www.daisy.org/z3986/2005/ncx/">
					<head>
							<meta name="dtb:uid" content="urn:uuid:${this.uuid}" />
							<meta name="dtb:depth" content="1" />
							<meta name="dtb:totalPageCount" content="0" />
							<meta name="dtb:maxPageNumber" content="0" />
							<meta name="generated" content="true" />
					</head>
					<docTitle>
							<text>${this.title}</text>
					</docTitle>
					<navMap>
							<navPoint id="Text">
									<navLabel>
											<text>${this.title}</text>
									</navLabel>
									<content src="Text/${this.imgsNames[0]}.xhtml" />
							</navPoint>
					</navMap>
			</ncx>
		`;
    this.zip.file("OEBPS/toc.ncx", toc);
  }

  private generateNav() {
    const nav = `<?xml version="1.0" encoding="utf-8"?>
			<!DOCTYPE html>
			<html
				xmlns="http://www.w3.org/1999/xhtml"
				xmlns:epub="http://www.idpf.org/2007/ops"
			>
				<head>
					<title>${this.title}</title>
					<meta charset="utf-8" />
				</head>
				<body>
					<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc" id="toc">
						<ol>
							<li><a href="Text/${this.imgsNames[0]}.xhtml">${this.title}</a></li>
						</ol>
					</nav>
					<nav epub:type="page-list">
						<ol>
							<li><a href="Text/${this.imgsNames[0]}.xhtml">${this.title}</a></li>
						</ol>
					</nav>
				</body>
			</html>		
		`;

    this.zip.file("OEBPS/nav.xhtml", nav);
  }

  private generateText() {
    for (let i = 0; i < this.imgsBuff.length; i++) {
      const imgName = this.imgsNames[i];
      const fileName = this.fileNames[i];

      const text = `<?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE html>
            <html
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:epub="http://www.idpf.org/2007/ops"
            >
                <head>
                    <title>${imgName}</title>
                    <link href="style.css" type="text/css" rel="stylesheet" />
                    <meta name="viewport" content="width=1128, height=1648" />
                </head>
                <body style="">
                    <div style="text-align: center; top: 0%">
                        <img width="1128" height="1648" src="../Images/${fileName}" />
                    </div>
                </body>
            </html>			
        `;

      this.zip.file(`OEBPS/Text/${imgName}.xhtml`, text);
    }

    const css = `@page {
				margin: 0;
			}
			body {
				display: block;
				margin: 0;
				padding: 0;
			}
			#PV {
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
			}
			#PV-T {
				top: 0;
				width: 100%;
				height: 50%;
			}
			#PV-B {
				bottom: 0;
				width: 100%;
				height: 50%;
			}
			#PV-L {
				left: 0;
				width: 49.5%;
				height: 100%;
				float: left;
			}
			#PV-R {
				right: 0;
				width: 49.5%;
				height: 100%;
				float: right;
			}
			#PV-TL {
				top: 0;
				left: 0;
				width: 49.5%;
				height: 50%;
				float: left;
			}
			#PV-TR {
				top: 0;
				right: 0;
				width: 49.5%;
				height: 50%;
				float: right;
			}
			#PV-BL {
				bottom: 0;
				left: 0;
				width: 49.5%;
				height: 50%;
				float: left;
			}
			#PV-BR {
				bottom: 0;
				right: 0;
				width: 49.5%;
				height: 50%;
				float: right;
			}
			.PV-P {
				width: 100%;
				height: 100%;
				top: 0;
				position: absolute;
				display: none;
			}
			
		`;
    this.zip.file(`OEBPS/Text/style.css`, css);
  }
}
