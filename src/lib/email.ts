// Email notification utility
// Currently logs to console — swap in Resend/SendGrid later

function logEmail(type: string, to: string, subject: string, body: string) {
  console.log(`[EMAIL] ${type} → ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body: ${body}`);
}

export function sendQuoteReceivedEmail(to: string, requestTitle: string, quoterName: string, price: number) {
  logEmail(
    "quote_received",
    to,
    `New quote on "${requestTitle}"`,
    `${quoterName} submitted a quote for $${price}. View your request to accept or decline.`
  );
}

export function sendQuoteAcceptedEmail(to: string, requestTitle: string) {
  logEmail(
    "quote_accepted",
    to,
    `Your quote was accepted for "${requestTitle}"`,
    `Great news! Your quote has been accepted. Once payment is confirmed, you can begin the review.`
  );
}

export function sendReviewCompletedEmail(to: string, requestTitle: string) {
  logEmail(
    "review_completed",
    to,
    `Review completed for "${requestTitle}"`,
    `Your code review is ready to view. Check your dashboard for the full report.`
  );
}

export function sendNewMessageEmail(to: string, requestTitle: string, senderName: string, preview: string) {
  logEmail(
    "new_message",
    to,
    `New message on "${requestTitle}"`,
    `${senderName}: ${preview}`
  );
}
