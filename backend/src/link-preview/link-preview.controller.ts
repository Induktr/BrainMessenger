import { Controller, Get, Query, Logger } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { LinkPreviewService } from './link-preview.service';

@Controller('link-preview')
export class LinkPreviewController {
  constructor(private readonly linkPreviewService: LinkPreviewService) {}

  @Public() 
  @Get()
  async getLinkPreview(@Query('url') url: string) {
    if (!url) {
      return { error: 'URL is required' };
    }
    try {
      const decodedUrl = decodeURIComponent(url);
      return await this.linkPreviewService.getPreview(decodedUrl);
    } catch (error) {
      return { error: 'Invalid URL format' };
    }
  }
}
