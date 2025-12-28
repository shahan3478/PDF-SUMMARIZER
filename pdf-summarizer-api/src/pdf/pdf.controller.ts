import {
    Controller,
    Post,
    Get,
    UseGuards,
    Request,
    UploadedFile,
    UseInterceptors,
    Param,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { PdfService } from './pdf.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('pdf')
  export class PdfController {
    constructor(private readonly pdfService: PdfService) {}
  
    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadPdf(
      @UploadedFile() file: Express.Multer.File,
      @Request() req,
    ) {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
  
      try {
        console.log('Received file upload request:', {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          userId: req.user.userId,
        });
  
        const result = await this.pdfService.processPdf(file, req.user.userId);
        
        return {
          id: result._id,
          fileName: result.fileName,
          fileSize: result.fileSize,
          summary: result.summary,
          createdAt: result.createdAt,
        };
      } catch (error: any) {
        console.error('PDF Upload Controller Error:', error);
        throw new InternalServerErrorException(
          error.message || 'Failed to process PDF'
        );
      }
    }
  
    @Get('summaries')
    @UseGuards(JwtAuthGuard)
    async getSummaries(@Request() req) {
      return this.pdfService.getUserSummaries(req.user.userId);
    }
  
    @Get('summaries/:id')
    @UseGuards(JwtAuthGuard)
    async getSummary(@Param('id') id: string, @Request() req) {
      return this.pdfService.getSummaryById(id, req.user.userId);
    }
  }