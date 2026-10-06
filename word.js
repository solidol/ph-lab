// Minimal OOXML document in an uncompressed ZIP; works offline in the browser.
const encoder = new TextEncoder();
const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function zip(files) {
  const chunks = [], central = [];
  let offset = 0, centralSize = 0;
  const header = size => { const bytes = new Uint8Array(size); return [bytes, new DataView(bytes.buffer)]; };
  for (const [name, content] of Object.entries(files)) {
    const filename = encoder.encode(name), data = encoder.encode(content);
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit=0; bit<8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    crc = (crc ^ 0xffffffff) >>> 0;
    const [local,l] = header(30);
    l.setUint32(0,0x04034b50,true); l.setUint16(4,20,true); l.setUint16(12,33,true); l.setUint32(14,crc,true); l.setUint32(18,data.length,true); l.setUint32(22,data.length,true); l.setUint16(26,filename.length,true);
    chunks.push(local,filename,data);
    const [entry,e] = header(46);
    e.setUint32(0,0x02014b50,true); e.setUint16(4,20,true); e.setUint16(6,20,true); e.setUint16(14,33,true); e.setUint32(16,crc,true); e.setUint32(20,data.length,true); e.setUint32(24,data.length,true); e.setUint16(28,filename.length,true); e.setUint32(42,offset,true);
    central.push(entry,filename); centralSize += entry.length + filename.length; offset += local.length + filename.length + data.length;
  }
  const [end,e] = header(22);
  e.setUint32(0,0x06054b50,true); e.setUint16(8,central.length/2,true); e.setUint16(10,central.length/2,true); e.setUint32(12,centralSize,true); e.setUint32(16,offset,true);
  return new Blob([...chunks,...central,end], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
export function createWordTable(headers, rows) {
  const paragraph = text => `<w:p><w:r><w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
  const tableRow = (cells, heading=false) => `<w:tr>${heading ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${cells.map(cell => `<w:tc>${paragraph(cell)}</w:tc>`).join('')}</w:tr>`;
  const document = `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraph('Лабораторна робота 01. Відбиття та заломлення світла')}${paragraph('Результати вимірювань. R і T — частки енергії неполяризованого світла; середовища без поглинання.')}<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${['top','left','bottom','right','insideH','insideV'].map(side => `<w:${side} w:val="single" w:sz="4" w:color="808080"/>`).join('')}</w:tblBorders></w:tblPr>${tableRow(headers,true)}${rows.map(row => tableRow(row)).join('')}</w:tbl><w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr></w:body></w:document>`;
  return zip({
    '[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml':document
  });
}
