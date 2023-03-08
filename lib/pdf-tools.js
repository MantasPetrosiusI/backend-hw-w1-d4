import PdfPrinter from "pdfmake";

export const getBlogPostReadableStream = (blogPost) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  };
  const docDefinition = {
    content: [...content],
    defaultStyle: {
      font: "Roboto",
    },
    styles: {
      header: {
        fontSize: 15,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: false,
      },
    },
  };

  const printer = new PdfPrinter(fonts);
  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();
  return pdfReadableStream;
};
