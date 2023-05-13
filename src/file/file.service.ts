import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class FileService {
  constructor(private readonly httpService: HttpService) {}

  async uploadPublicFile(file: Express.Multer.File, filename: string) {
    try {
      const s3 = new S3();
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: file.buffer,
          Key: `${Date.now().toString()}-${filename}.${
            file.mimetype.split('/')[1]
          }`,
          ContentType: file.mimetype,
        })
        .promise();

      return {
        key: uploadResult.Key,
        url: uploadResult.Location,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getTypeImage(contentType: string) {
    const typeImage = contentType?.split(`/`)?.[1];
    if (!contentType || !typeImage) {
      return new Error('Tipo da imagem não encontrado.');
    }
    return typeImage;
  }

  sanitizeName(fileName: string) {
    if (fileName && fileName.indexOf(`.`)) {
      return fileName?.split('.')?.[0];
    }

    return fileName;
  }

  async uploadPublicFileFromUrl(url: string, fileName: string) {
    try {
      const data = await this.httpService.axiosRef.get(url, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(data.data, 'base64');

      const s3 = new S3();
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: buffer,
          Key: `${Date.now().toString()}-${this.sanitizeName(
            fileName,
          )}.${this.getTypeImage(data.headers['content-type'])}`,
        })
        .promise();

      return {
        key: uploadResult.Key,
        url: uploadResult.Location,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
