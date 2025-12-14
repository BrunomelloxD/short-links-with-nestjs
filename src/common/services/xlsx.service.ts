import { Injectable } from "@nestjs/common";
import * as XLSX from 'xlsx';
import { XlsxOptions } from "../interfaces/xlxs.interface";

@Injectable()
export class XlsxService {
  private readonly DEFAULT_SHEET_NAME = 'Sheet1';
  private readonly DEFAULT_COLUMN_WIDTH = 20;

  async generateListXlsx<T>(data: T[], options: XlsxOptions<T>): Promise<Buffer> {
    if (!data || data.length === 0) {
      throw new Error('Data cannot be empty');
    }

    const worksheetData = this.prepareWorksheetData(data, options);
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    this.setColumnWidths(worksheet, options);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook, 
      worksheet, 
      options.sheetName ?? this.DEFAULT_SHEET_NAME
    );

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  private prepareWorksheetData<T>(data: T[], options: XlsxOptions<T>): any[][] {
    const headers = options.columns.map(col => col.label);
    const rows = data.map(item =>
      options.columns.map(col => col.value(item))
    );

    return [headers, ...rows];
  }

  private setColumnWidths<T>(worksheet: XLSX.WorkSheet, options: XlsxOptions<T>): void {
    worksheet['!cols'] = options.columns.map(col => ({
      wch: col.width ?? this.DEFAULT_COLUMN_WIDTH
    }));
  }

  async generateUserListXlsx(
    users: Array<{ name: string; email: string }>
  ): Promise<Buffer> {
    return this.generateListXlsx(users, {
      sheetName: 'Usuários',
      columns: [
        { label: 'Nome', value: (user) => user.name, width: 30 },
        { label: 'Email', value: (user) => user.email, width: 40 }
      ]
    });
  }

  async generateLinkListXlsx(
    links: Array<{ url: string; createdAt: Date }>
  ): Promise<Buffer> {
    return this.generateListXlsx(links, {
      sheetName: 'Links',
      columns: [
        { label: 'URL', value: (link) => link.url, width: 50 },
        { label: 'Criado em', value: (link) => link.createdAt.toLocaleDateString(), width: 20 }
      ]
    });
  }
}