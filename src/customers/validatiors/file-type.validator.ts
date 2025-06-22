import { FileValidator } from '@nestjs/common';

export interface CustomFileTypeValidatorOptions {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export class CustomFileTypeValidator extends FileValidator<CustomFileTypeValidatorOptions> {
  constructor(
    protected readonly validationOptions: CustomFileTypeValidatorOptions,
  ) {
    super(validationOptions);
  }

  public isValid(file?: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    const { allowedMimeTypes, allowedExtensions } = this.validationOptions;

    const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const extensionValid = extension && allowedExtensions.includes(extension);

    return (mimeTypeValid && extensionValid) as boolean;
  }

  public buildErrorMessage(): string {
    const { allowedMimeTypes, allowedExtensions } = this.validationOptions;
    return `File type not allowed. Allowed MIME types: ${allowedMimeTypes.join(', ')}. Allowed extensions: ${allowedExtensions.join(', ')}`;
  }
}
