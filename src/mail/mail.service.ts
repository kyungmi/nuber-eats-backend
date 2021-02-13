import { Inject, Injectable } from '@nestjs/common';

import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    //this.sendEmail('testing', 'test');
  }

  private async sendEmail(
    subject: string,
    template: string,
    emailvars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `Nuber Eats <mailgun@${this.options.domain}>`);
    form.append('to', 'purecolor85@gmail.com');
    form.append('subject', subject);
    form.append('template', template);
    emailvars.forEach(({ key, value }) => form.append(`v:${key}`, value));
    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
          method: 'POST',
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    await this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
