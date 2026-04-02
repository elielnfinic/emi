import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'smtp.mailtrap.io'),
      port: env.get('SMTP_PORT', 587),
      auth: {
        type: 'login' as const,
        user: env.get('SMTP_USERNAME', ''),
        pass: env.get('SMTP_PASSWORD', ''),
      },
    }),
  },
})

export default mailConfig
