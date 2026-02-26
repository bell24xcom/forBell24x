import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/supplier/gst - Save GST information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      gstin, panNumber, legalName, tradeName, registrationType,
      registrationDate, status, address, state, pincode,
      businessType, taxPayerType
    } = body;

    // Basic validation
    if (!gstin || !panNumber || !legalName) {
      return NextResponse.json({
        success: false,
        message: 'GSTIN, PAN, and Legal Name are required',
      }, { status: 400 });
    }

    // Validate GSTIN format (15 characters)
    if (gstin.length !== 15) {
      return NextResponse.json({
        success: false,
        message: 'GSTIN must be 15 characters',
      }, { status: 400 });
    }

    // Validate PAN format (10 characters)
    if (panNumber.length !== 10) {
      return NextResponse.json({
        success: false,
        message: 'PAN must be 10 characters',
      }, { status: 400 });
    }

    // TODO: Save GST info to database
    // TODO: Trigger GST verification via external API

    console.log('GST information saved:', {
      gstin,
      panNumber,
      legalName,
      registrationType,
    });

    return NextResponse.json({
      success: true,
      message: 'GST information saved successfully',
      gst: {
        gstin,
        panNumber,
        legalName,
        status: 'pending_verification',
      },
    });
  } catch (error) {
    console.error('Error saving GST information:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save GST information',
    }, { status: 500 });
  }
}

// GET /api/supplier/gst - Get GST information
export async function GET(request: NextRequest) {
  try {
    // TODO: Get supplier ID from auth session
    // TODO: Fetch GST info from database

    return NextResponse.json({
      success: true,
      gst: {
        gstin: '',
        panNumber: '',
        legalName: '',
        tradeName: '',
        registrationType: '',
        registrationDate: '',
        status: 'Active',
        address: '',
        state: '',
        pincode: '',
        businessType: '',
        taxPayerType: '',
      },
    });
  } catch (error) {
    console.error('Error fetching GST information:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch GST information',
    }, { status: 500 });
  }
}
