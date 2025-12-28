import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PdfSummary, PdfSummaryDocument } from '../schemas/pdf-summary.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

// Import pdf-parse - the module itself should be the function
// @ts-ignore - pdf-parse is a CommonJS module
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfService {
  constructor(
    @InjectModel(PdfSummary.name) private pdfSummaryModel: Model<PdfSummaryDocument>,
    private configService: ConfigService,
  ) {}

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      if (!buffer || buffer.length === 0) {
        throw new Error('Invalid PDF buffer');
      }
      
      // pdf-parse should export the function directly
      // If it's an object, try calling it as a function or access the default
      let data;
      if (typeof pdfParse === 'function') {
        data = await pdfParse(buffer);
      } else if (pdfParse.default && typeof pdfParse.default === 'function') {
        data = await pdfParse.default(buffer);
      } else {
        // If it's an object with PDFParse class, we might need to use it differently
        // But standard pdf-parse should work with direct require
        throw new Error(`pdf-parse is not callable. Type: ${typeof pdfParse}, Keys: ${Object.keys(pdfParse || {}).join(', ')}`);
      }
      
      if (!data || !data.text) {
        throw new Error('No text content found in PDF');
      }
      
      return data.text;
    } catch (error: any) {
      console.error('PDF Parse Error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async summarizeText(text: string): Promise<string> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    // Use a valid OpenRouter model - common options:
    // - openai/gpt-3.5-turbo (cheap, fast)
    // - openai/gpt-4 (more accurate)
    // - meta-llama/llama-3.1-70b-instruct (open source)
    // - google/gemini-pro-1.5 (good for long context)
    // - nex-agi/deepseek-v3.1-nex-n1:free (if available)
    const model = this.configService.get<string>('OPENROUTER_MODEL') || 'openai/gpt-3.5-turbo';

    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes PDF documents concisely and accurately.',
            },
            {
              role: 'user',
              content: `Please provide a comprehensive summary of the following text:\n\n${text.substring(0, 50000)}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
            'X-Title': 'PDF Summarizer',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenRouter API');
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      throw new Error(`Failed to generate summary: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async processPdf(file: Express.Multer.File, userId: string): Promise<PdfSummaryDocument> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      if (!file.buffer) {
        throw new Error('File buffer is missing');
      }

      console.log('Processing PDF:', file.originalname, 'Size:', file.size);

      const text = await this.extractTextFromPdf(file.buffer);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF');
      }

      console.log('Extracted text length:', text.length);

      const summary = await this.summarizeText(text);
      
      console.log('Summary generated, length:', summary.length);

      const pdfSummary = new this.pdfSummaryModel({
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        summary,
        originalText: text.substring(0, 10000),
      });

      const saved = await pdfSummary.save();
      console.log('PDF summary saved to database');
      
      return saved;
    } catch (error: any) {
      console.error('Process PDF Error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async getUserSummaries(userId: string): Promise<PdfSummaryDocument[]> {
    return this.pdfSummaryModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async getSummaryById(id: string, userId: string): Promise<PdfSummaryDocument | null> {
    return this.pdfSummaryModel.findOne({ _id: id, userId }).exec();
  }
}