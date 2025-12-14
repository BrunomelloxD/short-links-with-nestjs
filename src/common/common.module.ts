import { Global, Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { XlsxService } from './services/xlsx.service';

@Global()
@Module({
  providers: [PdfService, XlsxService],
  exports: [PdfService, XlsxService],
})
export class CommonModule {}
