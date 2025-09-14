import nodemailer from 'nodemailer'

export type MailInput = {
  to: string
  subject: string
  text?: string
  html?: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  const host = process.env['SMTP_HOST']
  const port = Number(process.env['SMTP_PORT'] ?? 465)
  const secure = String(process.env['SMTP_SECURE'] ?? 'true') === 'true'
  const user = process.env['SMTP_USER']
  const pass = process.env['SMTP_PASS']

  if (!host || !user || !pass) {
    console.warn('[Mailer] SMTP not configured. Emails will be skipped.')
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  })

  return transporter
}

const Mailer = {
  async send({ to, subject, text, html }: MailInput): Promise<void> {
    const tr = getTransporter()
    const fromEmail = process.env['MAIL_FROM_EMAIL'] || process.env['SMTP_USER'] || 'no-reply@example.com'
    const fromName = process.env['MAIL_FROM_NAME'] || 'Notifications'
    const from = `"${fromName}" <${fromEmail}>`

    if (!tr) {
      console.log('[Mailer:SKIP]', { to, subject, text, html })
      return
    }

    await tr.sendMail({
      from,
      to,
      subject,
      text: text ?? '',
      html: html ?? (text ? `<pre>${text}</pre>` : '<p></p>')
    })
  }
}

export default Mailer