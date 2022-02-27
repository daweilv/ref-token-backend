import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.info("nest server started");
  app.enableCors();
  await app.listen(3000);
}

bootstrap();
