import * as React from 'react';

interface NewsletterEmailProps {
  subscriberName?: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  unsubscribeUrl: string;
}

export const NewsletterEmail = ({
  subscriberName,
  postTitle,
  postExcerpt,
  postUrl,
  unsubscribeUrl,
}: NewsletterEmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #eee' }}>
          <h1 style={{ color: '#111', margin: 0, fontSize: '24px' }}>The Open Draft</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>Tech Education + Feeding Stray Animals</p>
        </div>

        {/* Main Content */}
        <div style={{ padding: '30px 20px' }}>
          {subscriberName && (
            <p style={{ fontSize: '16px', color: '#333', marginTop: 0 }}>
              Hi {subscriberName},
            </p>
          )}

          <h2 style={{ color: '#111', fontSize: '28px', marginBottom: '15px', lineHeight: '1.3' }}>
            {postTitle}
          </h2>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8', marginBottom: '25px' }}>
            {postExcerpt}
          </p>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href={postUrl}
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Read Full Article →
            </a>
          </div>
        </div>

        {/* Impact Section */}
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', margin: '20px' }}>
          <h3 style={{ color: '#111', fontSize: '18px', marginTop: 0 }}>Your Impact</h3>
          <p style={{ fontSize: '14px', color: '#555', margin: '10px 0' }}>
            Every subscription helps us feed stray animals across India. Thank you for being part of our mission!
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #eee', marginTop: '30px' }}>
          <p style={{ fontSize: '14px', color: '#888', margin: '5px 0' }}>
            © {new Date().getFullYear()} The Open Draft. All rights reserved.
          </p>
          <p style={{ fontSize: '13px', color: '#999', margin: '10px 0' }}>
            <a href={unsubscribeUrl} style={{ color: '#666', textDecoration: 'underline' }}>
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
  </html>
);

interface WelcomeEmailProps {
  subscriberName?: string;
}

export const WelcomeEmail = ({ subscriberName }: WelcomeEmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <h1 style={{ color: '#111', margin: 0, fontSize: '32px' }}>Welcome to The Open Draft!</h1>
        </div>

        {/* Main Content */}
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '18px', color: '#333' }}>
            {subscriberName ? `Hi ${subscriberName}!` : 'Hi there!'}
          </p>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8' }}>
            Thank you for joining our mission! You're now part of a community that's learning about technology while making a real difference in the lives of stray animals.
          </p>

          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ color: '#1e40af', marginTop: 0, fontSize: '18px' }}>What to Expect:</h3>
            <ul style={{ color: '#374151', paddingLeft: '20px', margin: '10px 0' }}>
              <li style={{ marginBottom: '8px' }}>Deep-dive articles explaining how technology works</li>
              <li style={{ marginBottom: '8px' }}>Clear explanations of complex technical concepts</li>
              <li style={{ marginBottom: '8px' }}>Monthly impact reports on animals we've helped feed</li>
              <li style={{ marginBottom: '8px' }}>Photos and updates from our feeding missions</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ color: '#92400e', marginTop: 0, fontSize: '18px' }}>The Dual Mission:</h3>
            <p style={{ color: '#78350f', margin: '10px 0', fontSize: '15px' }}>
              <strong>Tech Education:</strong> We break down complex technology into digestible, engaging articles.
            </p>
            <p style={{ color: '#78350f', margin: '10px 0', fontSize: '15px' }}>
              <strong>Animal Welfare:</strong> 100% of subscription proceeds (after minimal operating costs) go directly to buying food for stray dogs, cats, cows, and birds across India.
            </p>
          </div>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8', marginTop: '25px' }}>
            We'll send you updates when new articles are published. You can unsubscribe anytime.
          </p>

          <p style={{ fontSize: '16px', color: '#555', marginTop: '20px' }}>
            Thank you for being part of something bigger!
          </p>

          <p style={{ fontSize: '16px', color: '#555', marginTop: '20px', marginBottom: 0 }}>
            — The Open Draft Team
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #eee', marginTop: '30px' }}>
          <p style={{ fontSize: '14px', color: '#888', margin: '5px 0' }}>
            © {new Date().getFullYear()} The Open Draft. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
);
