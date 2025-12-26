import { NextRequest, NextResponse } from 'next/server';

interface TradeEstimate {
  trade: string;
  tradeName: string;
  cost: number;
  savings: number;
  optimizedCost: number;
  breakdown: string;
}

interface QuoteSubmission {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    preferredContact: string;
    notes: string;
  };
  projectDetails?: {
    projectType: string;
    location: string;
    squareFootage: string;
    province: string;
  };
  selectedTrades: TradeEstimate[];
  totalCost: number;
  totalSavings: number;
  optimizedTotal: number;
  submittedAt: string;
}

// Email sending function (using environment variable for contractor email)
async function sendEmailNotification(quoteData: QuoteSubmission): Promise<boolean> {
  const contractorEmail = process.env.CONTRACTOR_EMAIL || 'quotes@example.com';

  // Format the quote for email
  const tradesList = quoteData.selectedTrades
    .map(t => `  - ${t.tradeName}: $${t.cost.toLocaleString()} (Savings: $${t.savings.toLocaleString()})`)
    .join('\n');

  const emailBody = `
NEW QUOTE REQUEST

Customer Information:
---------------------
Name: ${quoteData.customerInfo.name}
Email: ${quoteData.customerInfo.email}
Phone: ${quoteData.customerInfo.phone}
Preferred Contact: ${quoteData.customerInfo.preferredContact}
Project Address: ${quoteData.customerInfo.address || 'Not provided'}

Project Details:
----------------
Project Type: ${quoteData.projectDetails?.projectType || 'Not specified'}
Location: ${quoteData.projectDetails?.location || 'Not specified'}
Province: ${quoteData.projectDetails?.province || 'Not specified'}
Square Footage: ${quoteData.projectDetails?.squareFootage || 'Not specified'}

Selected Trades:
----------------
${tradesList}

Quote Summary:
--------------
Estimated Total: $${quoteData.totalCost.toLocaleString()}
Potential Savings: $${quoteData.totalSavings.toLocaleString()}
Optimized Total: $${quoteData.optimizedTotal.toLocaleString()}

Additional Notes:
-----------------
${quoteData.customerInfo.notes || 'None'}

Submitted: ${new Date(quoteData.submittedAt).toLocaleString()}
`;

  // If Resend API key is configured, send email
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'BizOptimize Pro <quotes@bizoptimize.pro>',
          to: [contractorEmail],
          subject: `New Quote Request from ${quoteData.customerInfo.name}`,
          text: emailBody,
          reply_to: quoteData.customerInfo.email,
        }),
      });

      if (!response.ok) {
        console.error('Resend API error:', await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  // If SendGrid API key is configured
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendgridApiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: contractorEmail }] }],
          from: { email: 'quotes@bizoptimize.pro', name: 'BizOptimize Pro' },
          subject: `New Quote Request from ${quoteData.customerInfo.name}`,
          content: [{ type: 'text/plain', value: emailBody }],
          reply_to: { email: quoteData.customerInfo.email },
        }),
      });

      if (!response.ok) {
        console.error('SendGrid API error:', await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  // Log the quote if no email service is configured
  console.log('=== NEW QUOTE SUBMISSION ===');
  console.log(`To: ${contractorEmail}`);
  console.log(emailBody);
  console.log('============================');

  return true; // Return true even without email - quote is logged
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteSubmission = await request.json();

    // Validate required fields
    if (!body.customerInfo?.name || !body.customerInfo?.email || !body.customerInfo?.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerInfo.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send email notification to contractor
    const emailSent = await sendEmailNotification(body);

    // Store quote in database (if configured)
    // For now, we'll just log it
    console.log('Quote submitted:', {
      customer: body.customerInfo.name,
      email: body.customerInfo.email,
      trades: body.selectedTrades.map(t => t.tradeName),
      total: body.totalCost,
      timestamp: body.submittedAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      emailSent,
      quoteId: `Q-${Date.now()}`, // Generate a simple quote ID
    });

  } catch (error) {
    console.error('Quote submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit quote request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/quotes/submit',
    description: 'Submit construction quote requests',
    method: 'POST',
    requiredFields: ['customerInfo.name', 'customerInfo.email', 'customerInfo.phone'],
  });
}
