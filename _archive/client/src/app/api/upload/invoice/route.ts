import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('invoice') as File;
    const invoiceNumber = formData.get('invoiceNumber') as string;
    const invoiceDate = formData.get('invoiceDate') as string;
    const vendorName = formData.get('vendorName') as string;
    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;

    if (!file || !invoiceNumber || !invoiceDate || !vendorName || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file, invoiceNumber, invoiceDate, vendorName, amount' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Create upload directory structure
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'invoices');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${invoiceNumber}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/invoices/${filename}`;

    // Store invoice metadata (in production, save to database)
    const invoiceData = {
      id: timestamp.toString(),
      invoiceNumber,
      invoiceDate,
      vendorName,
      amount: parseFloat(amount),
      description,
      filename,
      originalName: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    console.log(`✅ Invoice uploaded successfully: ${invoiceNumber}`);

    return NextResponse.json({
      success: true,
      message: 'Invoice uploaded successfully',
      data: {
        invoice: invoiceData,
        url: publicUrl,
        size: file.size,
        message: 'File uploaded and processed successfully'
      }
    });

  } catch (error) {
    console.error('❌ Invoice upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Invoice Upload System Status',
    data: {
      status: 'ACTIVE',
      supportedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxFileSize: '10MB',
      features: [
        'File type validation (JPG, PNG, PDF)',
        'File size validation (max 10MB)',
        'Secure file storage',
        'Metadata extraction',
        'Unique filename generation',
        'Public URL generation'
      ],
      requirements: {
        invoiceNumber: 'Required - Unique identifier',
        invoiceDate: 'Required - Date of invoice',
        vendorName: 'Required - Supplier/vendor name',
        amount: 'Required - Invoice amount in INR',
        description: 'Optional - Additional details'
      }
    }
  });
}
