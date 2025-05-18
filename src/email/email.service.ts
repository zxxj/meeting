import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '1285367184@qq.com',
        pass: 'ylrmhmvuanyajadi',
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: '1285367184@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
