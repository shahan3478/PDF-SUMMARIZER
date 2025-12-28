import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PdfSummaryDocument = PdfSummary & Document;

@Schema({ timestamps: true })
export class PdfSummary {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true })
  summary: string;

  @Prop()
  originalText?: string;

  // Timestamps are automatically added by Mongoose, but we need to declare them for TypeScript
  createdAt?: Date;
  updatedAt?: Date;
}

export const PdfSummarySchema = SchemaFactory.createForClass(PdfSummary);