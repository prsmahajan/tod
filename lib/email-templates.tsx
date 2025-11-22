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

// Waitlist Email Templates
interface WaitlistWelcomeEmailProps {
  name?: string;
  position: number;
  referralCode: string;
  dashboardUrl: string;
}

export const WaitlistWelcomeEmail = ({ name, position, referralCode, dashboardUrl }: WaitlistWelcomeEmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '30px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0', margin: '-20px -20px 20px -20px' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '32px', fontWeight: 'bold' }}>🎉 You're In!</h1>
          <p style={{ color: '#fff', margin: '10px 0 0 0', fontSize: '18px', opacity: 0.95 }}>
            Welcome to The Open Draft Waitlist
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>
            {name ? `Hi ${name}!` : 'Hi there!'}
          </p>

          <div style={{ backgroundColor: '#f0f9ff', padding: '25px', borderRadius: '12px', margin: '25px 0', border: '2px solid #3b82f6', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: 0, color: '#1e40af', fontWeight: 'bold' }}>#{position}</p>
            <p style={{ fontSize: '20px', color: '#1e40af', margin: '10px 0 0 0', fontWeight: '600' }}>
              You're Feeder #{position.toLocaleString()}!
            </p>
            <p style={{ fontSize: '16px', color: '#1e3a8a', margin: '10px 0 0 0' }}>
              You're among the first {position.toLocaleString()} people to join our mission
            </p>
          </div>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8' }}>
            Thank you for joining the waitlist! You're now part of an exclusive group of early supporters who will get <strong>first access</strong> when we launch.
          </p>

          <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ color: '#92400e', marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>🌟 What You Get as a Founding Member:</h3>
            <ul style={{ color: '#78350f', paddingLeft: '20px', margin: '10px 0' }}>
              <li style={{ marginBottom: '8px' }}><strong>First access</strong> when we launch subscriptions</li>
              <li style={{ marginBottom: '8px' }}><strong>Founding member badge</strong> on your profile</li>
              <li style={{ marginBottom: '8px' }}><strong>Help us reach 1,000 faster</strong> = feeding starts sooner!</li>
              <li style={{ marginBottom: '8px' }}>Exclusive updates and behind-the-scenes content</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ color: '#065f46', marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>🚀 Help Us Reach 1,000 Faster!</h3>
            <p style={{ color: '#047857', margin: '10px 0', fontSize: '15px', lineHeight: '1.8' }}>
              Share your unique referral link and help us reach our goal faster. Every person you refer brings us one step closer to feeding animals!
            </p>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <a
                href={dashboardUrl}
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                View Your Dashboard →
              </a>
            </div>
          </div>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8', marginTop: '25px' }}>
            We'll keep you updated on our progress. The more people join, the sooner we can start making a real impact!
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

interface WaitlistDay3EmailProps {
  name?: string;
  position: number;
  progressPercent: number;
  referralCode: string;
  dashboardUrl: string;
}

export const WaitlistDay3Email = ({ name, position, progressPercent, referralCode, dashboardUrl }: WaitlistDay3EmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <h1 style={{ color: '#111', margin: 0, fontSize: '28px' }}>🐾 Meet the Animals You'll Help Feed</h1>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '18px', color: '#333' }}>
            {name ? `Hi ${name}!` : 'Hi there!'}
          </p>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8' }}>
            We're making great progress! Here's a glimpse of the animals you'll help feed once we launch.
          </p>

          <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ color: '#92400e', marginTop: 0, fontSize: '18px' }}>📊 Our Progress</h3>
            <p style={{ fontSize: '32px', color: '#92400e', margin: '10px 0', fontWeight: 'bold' }}>
              {progressPercent}%
            </p>
            <p style={{ color: '#78350f', margin: '10px 0', fontSize: '15px' }}>
              We're at {progressPercent}% of our goal to reach 1,000 Feeders!
            </p>
          </div>

          <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '8px', margin: '25px 0' }}>
            <h3 style={{ color: '#1e40af', marginTop: 0, fontSize: '18px' }}>🐕 Meet 3 Animals You'll Help:</h3>
            <p style={{ color: '#374151', margin: '10px 0', fontSize: '15px', lineHeight: '1.8' }}>
              • <strong>Rusty</strong> - A friendly street dog in Mumbai who waits near the local market every evening<br/>
              • <strong>Whiskers</strong> - A gentle cat in Delhi who has been feeding her kittens<br/>
              • <strong>Bella</strong> - A cow in Bangalore who's become a neighborhood favorite
            </p>
            <p style={{ color: '#374151', margin: '15px 0 0 0', fontSize: '15px', lineHeight: '1.8' }}>
              Every subscription helps us provide regular meals to animals like these across India.
            </p>
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href={dashboardUrl}
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
              Check Your Position →
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #eee', marginTop: '30px' }}>
          <p style={{ fontSize: '14px', color: '#888', margin: '5px 0' }}>
            © {new Date().getFullYear()} The Open Draft. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
);

interface WaitlistDay7EmailProps {
  name?: string;
  position: number;
  progressPercent: number;
  referralCode: string;
  referralUrl: string;
  dashboardUrl: string;
}

export const WaitlistDay7Email = ({ name, position, progressPercent, referralCode, referralUrl, dashboardUrl }: WaitlistDay7EmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <h1 style={{ color: '#111', margin: 0, fontSize: '28px' }}>📚 Exclusive Preview + Progress Update</h1>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '18px', color: '#333' }}>
            {name ? `Hi ${name}!` : 'Hi there!'}
          </p>

          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.8' }}>
            As a founding member, we wanted to give you an exclusive preview of what's coming!
          </p>

          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ color: '#1e40af', marginTop: 0, fontSize: '18px' }}>📖 First Tech Article Preview</h3>
            <p style={{ color: '#374151', margin: '10px 0', fontSize: '15px', lineHeight: '1.8' }}>
              We're working on our first deep-dive article: <strong>"How HTTPS Really Works: A Simple Explanation"</strong>
            </p>
            <p style={{ color: '#374151', margin: '10px 0', fontSize: '15px', lineHeight: '1.8' }}>
              This is the kind of content you'll get - breaking down complex tech concepts into simple, engaging stories. Stay tuned!
            </p>
          </div>

          <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ color: '#92400e', marginTop: 0, fontSize: '18px' }}>📊 Progress Update</h3>
            <p style={{ fontSize: '32px', color: '#92400e', margin: '10px 0', fontWeight: 'bold' }}>
              {progressPercent}%
            </p>
            <p style={{ color: '#78350f', margin: '10px 0', fontSize: '15px' }}>
              We're at {progressPercent}% of our goal! Every new member brings us closer to launch.
            </p>
          </div>

          <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '8px', margin: '25px 0', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ color: '#065f46', marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>🎯 Invite 3 Friends!</h3>
            <p style={{ color: '#047857', margin: '10px 0', fontSize: '15px', lineHeight: '1.8' }}>
              Help us reach 1,000 faster! Share your unique link with 3 friends who care about tech and animals:
            </p>
            <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '6px', margin: '15px 0', border: '1px solid #10b981' }}>
              <p style={{ fontSize: '14px', color: '#065f46', margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {referralUrl}
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <a
                href={dashboardUrl}
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                View Your Dashboard →
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #eee', marginTop: '30px' }}>
          <p style={{ fontSize: '14px', color: '#888', margin: '5px 0' }}>
            © {new Date().getFullYear()} The Open Draft. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
);
