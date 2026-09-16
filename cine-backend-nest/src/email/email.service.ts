import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor (
        private readonly emailService: EmailService
    ) {}
    

}
