import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from '../../core/video/video.service';
import { CreateVideoDto, VideoAnalysisDto } from '../../core/video/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('video')
@UseGuards(AuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async getAllVideos(@Query() query: any) {
    return this.videoService.getAllVideos(query);
  }

  @Get(':id')
  async getVideo(@Param('id') id: string) {
    return this.videoService.getVideoById(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Body() metadata: any) {
    return this.videoService.uploadVideo(file, metadata);
  }

  @Post()
  async createVideo(@Body() dto: CreateVideoDto) {
    return this.videoService.createVideo(dto);
  }

  @Put(':id')
  async updateVideo(@Param('id') id: string, @Body() dto: CreateVideoDto) {
    return this.videoService.updateVideo(id, dto);
  }

  @Get(':id/stream')
  async streamVideo(@Param('id') id: string, @Query() query: any) {
    return this.videoService.streamVideo(id, query);
  }

  @Get(':id/thumbnail')
  async getVideoThumbnail(@Param('id') id: string) {
    return this.videoService.getVideoThumbnail(id);
  }

  @Post(':id/transcode')
  async transcodeVideo(@Param('id') id: string, @Body() transcodeOptions: any) {
    return this.videoService.transcodeVideo(id, transcodeOptions);
  }

  @Get(':id/transcode/status')
  async getTranscodeStatus(@Param('id') id: string) {
    return this.videoService.getTranscodeStatus(id);
  }

  @Post(':id/analyze')
  async analyzeVideo(@Param('id') id: string, @Body() dto: VideoAnalysisDto) {
    return this.videoService.analyzeVideo(id, dto);
  }

  @Get(':id/analysis')
  async getVideoAnalysis(@Param('id') id: string) {
    return this.videoService.getVideoAnalysis(id);
  }

  @Post(':id/ai/process')
  async processVideoAI(@Param('id') id: string, @Body() aiOptions: any) {
    return this.videoService.processVideoAI(id, aiOptions);
  }

  @Get(':id/ai/results')
  async getAIResults(@Param('id') id: string) {
    return this.videoService.getAIResults(id);
  }

  @Post(':id/annotate')
  async annotateVideo(@Param('id') id: string, @Body() annotations: any) {
    return this.videoService.annotateVideo(id, annotations);
  }

  @Get(':id/annotations')
  async getVideoAnnotations(@Param('id') id: string) {
    return this.videoService.getVideoAnnotations(id);
  }

  @Post(':id/caption')
  async generateCaptions(@Param('id') id: string, @Body() captionOptions: any) {
    return this.videoService.generateCaptions(id, captionOptions);
  }

  @Get(':id/captions')
  async getVideoCaptions(@Param('id') id: string) {
    return this.videoService.getVideoCaptions(id);
  }

  @Post(':id/compress')
  async compressVideo(@Param('id') id: string, @Body() compressionOptions: any) {
    return this.videoService.compressVideo(id, compressionOptions);
  }

  @Get(':id/quality')
  async getVideoQuality(@Param('id') id: string) {
    return this.videoService.getVideoQuality(id);
  }

  @Post(':id/watermark')
  async addWatermark(@Param('id') id: string, @Body() watermarkData: any) {
    return this.videoService.addWatermark(id, watermarkData);
  }

  @Post(':id/trim')
  async trimVideo(@Param('id') id: string, @Body() trimData: any) {
    return this.videoService.trimVideo(id, trimData);
  }

  @Get('formats/supported')
  async getSupportedFormats() {
    return this.videoService.getSupportedFormats();
  }

  @Get('codecs/available')
  async getAvailableCodecs() {
    return this.videoService.getAvailableCodecs();
  }

  @Get('analytics/usage')
  async getVideoUsageAnalytics(@Query() query: any) {
    return this.videoService.getUsageAnalytics(query);
  }

  @Get('storage/status')
  async getStorageStatus() {
    return this.videoService.getStorageStatus();
  }

  @Post('batch/process')
  @UseGuards(RoleGuard)
  async batchProcessVideos(@Body() batchData: any) {
    return this.videoService.batchProcessVideos(batchData);
  }

  @Get('batch/:batchId/status')
  async getBatchStatus(@Param('batchId') batchId: string) {
    return this.videoService.getBatchStatus(batchId);
  }
} 