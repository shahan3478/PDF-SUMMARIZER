import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PdfSummary, PdfSummarySchema } from '../schemas/pdf-summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PdfSummary.name, schema: PdfSummarySchema }]),
  ],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}