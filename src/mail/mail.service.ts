import { Inject, Injectable } from '@nestjs/common';

import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // this.sendEmail('testing', 'test');
  }

  private async sendEmail(
    subject: string,
    content: string,
    to: string = 'purecolor85@gmail.com',
  ) {
    const form = new FormData();
    form.append('from', `Excited User <${this.options.fromEmail}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('text', content);
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
    console.log(response.body);
  }
}
