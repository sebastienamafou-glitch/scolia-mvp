import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config'; // Souvent nécessaire pour les clés API

@Module({
  imports: [ConfigModule], 
  providers: [MailService],
  exports: [MailService], // 👈 Indispensable pour l'utiliser ailleurs
})
export class MailModule {}
