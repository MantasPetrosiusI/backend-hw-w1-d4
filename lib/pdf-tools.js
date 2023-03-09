import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";
import { getBlogPostPDFWriteStream } from "./fs-tools.js";
import { pipeline } from "stream";
import { promisify } from "util";

export const getBlogPostReadableStream = async (blogPost) => {
  const coverToBase64 = await imageToBase64(blogPost.cover);
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  };
  const docDefinition = {
    content: [
      {
        image: `data:image/jpeg;base64,${coverToBase64}`,
        width: 300,
        alignment: "center",
      },
      {
        text: [blogPost.title],
        bold: true,
        fontSize: 17,
      },
      {
        text: [blogPost.content],
        fontSize: 15,
      },
    ],
    defaultStyle: {
      font: "Roboto",
    },
  };

  const printer = new PdfPrinter(fonts);
  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();
  return pdfReadableStream;
};

export const asyncBlogPostsPDFGenerator = async (file) => {
  const source = await getBlogPostReadableStream(file);
  const destination = getBlogPostPDFWriteStream(`${file.author.name}.pdf`);

  const promisePipeline = promisify(pipeline);
  await promisePipeline(source, destination);
};
