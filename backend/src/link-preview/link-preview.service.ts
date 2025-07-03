import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class LinkPreviewService {
  async getPreview(url: string) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 5000, // 5 second timeout
      });

      const $ = cheerio.load(data);

      const getMetaTag = (name) => {
        return (
          $(`meta[property="og:${name}"]`).attr('content') ||
          $(`meta[name="twitter:${name}"]`).attr('content') ||
          $(`meta[name="${name}"]`).attr('content')
        );
      };

      const title = getMetaTag('title') || $('title').first().text() || '';
      const description = getMetaTag('description') || '';
      const image = getMetaTag('image') || '';
      const siteName = getMetaTag('site_name') || new URL(url).hostname;

      return {
        url,
        title,
        description,
        image,
        siteName,
      };
    } catch (error) {
      console.error(`Error fetching preview for ${url}:`, error.message);
      // Return a more structured error
      return { error: true, message: 'Could not fetch link preview.', url };
    }
  }
}
