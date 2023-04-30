import { Req, Res, Injectable } from '@nestjs/common';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';
import { HttpService } from '@nestjs/axios';
import fs from 'fs';

const bucketName = process.env.AWS_BUCKET_NAME;

const region = process.env.AWS_BUCKET_REGION;

const accessKeyId = process.env.AWS_ACCESS_KEY;

const secretAccessKey = process.env.AWS_SECRET_KEY;

/* const s3 = new S3Client({
  credentials: { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey },
  region: region,
}); */

@Injectable()
export class FileService {
  constructor(private readonly httpService: HttpService) {}

  /*   async fileupload(@Req() req, @Res() res) {
    try {
      this.upload(req, res, function (error) {
        if (error) {
          console.log(error);
          return res.status(404).json(`Failed to upload image file: ${error}`);
        }
        return res.status(201).json(req.files[0].location);
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(`Failed to upload image file: ${error}`);
    }
  }

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      acl: 'private',
      key: function (request, file, cb) {
        cb(null, `${Date.now().toString()} - ${file.originalname}`);
      },
    }),
  }).array('upload', 1); */

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    try {
      const s3 = new S3();
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: dataBuffer,
          Key: `${Date.now().toString()}-${filename}.png`,
        })
        .promise();

      return {
        key: uploadResult.Key,
        url: uploadResult.Location,
      };
    } catch (err) {
      console.log(err);
      return { key: 'error', url: err.message };
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
      return { key: 'error', url: err.message };
    }
  }
}
