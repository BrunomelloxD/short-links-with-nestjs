import PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';
import { PdfOptions } from '../interfaces/pdf.interface';

@Injectable()
export class PdfService {
  private readonly DEFAULT_FONT_SIZE = 12;
  private readonly DEFAULT_TITLE_SIZE = 18;
  private readonly DEFAULT_MARGIN = 30;

  async generateListPdf<T>(data: T[], options: PdfOptions<T>): Promise<Buffer> {
    if (!data || data.length === 0) {
      throw new Error('Data cannot be empty');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: options.margin ?? this.DEFAULT_MARGIN 
      });
      const buffers: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.addTitle(doc, options.title);
      this.addContent(doc, data, options);
      
      doc.end();
    });
  }

  private addTitle(doc: InstanceType<typeof PDFDocument>, title: string): void {
    doc.fontSize(this.DEFAULT_TITLE_SIZE)
       .text(title, { align: 'center' });
    doc.moveDown();
  }

  private addContent<T>(
    doc: InstanceType<typeof PDFDocument>, 
    data: T[], 
    options: PdfOptions<T>
  ): void {
    doc.fontSize(options.fontSize ?? this.DEFAULT_FONT_SIZE);
    
    data.forEach((item, idx) => {
      const line = options.columns
        .map(col => `${col.label}: ${col.value(item)}`)
        .join(' | ');
      doc.text(`${idx + 1}. ${line}`);
    });
  }

  async generateUserListPdf(
    users: Array<{ name: string; email: string }>
  ): Promise<Buffer> {
    return this.generateListPdf(users, {
      title: 'Lista de Usuários',
      columns: [
        { label: 'Nome', value: (user) => user.name },
        { label: 'Email', value: (user) => user.email }
      ]
    });
  }

  async generateLinkListPdf(
    links: Array<{ url: string; createdAt: Date }>
  ): Promise<Buffer> {
    return this.generateListPdf(links, {
      title: 'Lista de Links',
      columns: [
        { label: 'URL', value: (link) => link.url },
        { label: 'Criado em', value: (link) => link.createdAt.toLocaleDateString() }
      ]
    });
  }
}