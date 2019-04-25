import React from 'react';
import {
  Page, Text, Image, View, Document, StyleSheet,
  createElement, pdf, PDFRenderer,
} from '@react-pdf/core';
import blobStream from 'blob-stream';

const Doc = () => (
  <Document>
    <Page wrap={true}>
      <Text fixed={true}>
        ~ HELLO PDF RENDERER ~
      </Text>
    </Page>
  </Document>
);

class Pdf extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      downloadUrl: null,
    }
    this.pdfNode = null;

    this.setPdfRef = elem => {
      this.pdfNode = elem;
    };

    this.renderPdf = async () => {
      if (this.pdfNode) {
        // Render the PDF here
        const element = <Doc />;

        const container = createElement('ROOT');
        const node = PDFRenderer.createContainer(container);
        PDFRenderer.updateContainer(element, node, null);
        const buffer = await pdf(container).toBuffer();
        const stream = buffer.pipe(blobStream());

        const url = await new Promise((resolve, reject) => {
          stream.on('finish', () => {
            resolve(stream.toBlobURL('application/pdf'));
          });
          stream.on('error', reject);
        });

        this.setState({downloadUrl: url});
        this.pdfNode.src = url;
      }
    }
  }

  componentDidMount() {
    this.renderPdf();
  }

  render() {
    return (
      <div>
        {this.state.downloadUrl && (
          <div><a href={this.state.downloadUrl} download="file.pdf">Download PDF</a></div>
        )}

        <iframe style={{width: 700, height: 800}} ref={this.setPdfRef}>
        </iframe>
      </div>
    );
  }

}

export default Pdf;
