import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    api: boolean;
    ai: {
      openrouter: boolean;
      openai: boolean;
    };
    email: {
      resend: boolean;
      sendgrid: boolean;
    };
  };
  environment: string;
}

export async function GET() {
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      api: true,
      ai: {
        openrouter: !!process.env.OPENROUTER_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
      },
      email: {
        resend: !!process.env.RESEND_API_KEY,
        sendgrid: !!process.env.SENDGRID_API_KEY,
      },
    },
    environment: process.env.NODE_ENV || 'development',
  };

  // Check if at least one AI provider is configured
  const hasAI = status.services.ai.openrouter || status.services.ai.openai;
  const hasEmail = status.services.email.resend || status.services.email.sendgrid;

  // Determine overall status
  if (!hasAI && !hasEmail) {
    status.status = 'degraded';
  }

  return NextResponse.json(status, {
    status: status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
