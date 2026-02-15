import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AlertService } from '../services/alert.service';
import { DiscordService } from '../services/discord.service';
import { TeamsService } from '../services/teams.service';

describe('Notification Workflow', () => {
  let alertService: AlertService;
  let discordService: DiscordService;
  let teamsService: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [AlertService, DiscordService, TeamsService],
    }).compile();

    alertService = module.get<AlertService>(AlertService);
    discordService = module.get<DiscordService>(DiscordService);
    teamsService = module.get<TeamsService>(TeamsService);
  });

  it('should send error alert to all channels', async () => {
    const error = new Error('Test error');
    const context = 'Test context';

    // Mock the services
    jest.spyOn(discordService, 'sendErrorAlert').mockResolvedValue(undefined);
    jest.spyOn(teamsService, 'sendErrorAlert').mockResolvedValue(undefined);

    await alertService.sendErrorAlert(error, context);

    expect(discordService.sendErrorAlert).toHaveBeenCalledWith(error, context);
    expect(teamsService.sendErrorAlert).toHaveBeenCalledWith(error, context);
  });

  it('should send warning alert to all channels', async () => {
    const message = 'Test warning';
    const metadata = { test: 'data' };

    // Mock the services
    jest.spyOn(discordService, 'sendWarningAlert').mockResolvedValue(undefined);
    jest.spyOn(teamsService, 'sendWarningAlert').mockResolvedValue(undefined);

    await alertService.sendWarningAlert(message, metadata);

    expect(discordService.sendWarningAlert).toHaveBeenCalledWith(message, metadata);
    expect(teamsService.sendWarningAlert).toHaveBeenCalledWith(message, metadata);
  });

  it('should send info alert to all channels', async () => {
    const message = 'Test info';
    const metadata = { test: 'data' };

    // Mock the services
    jest.spyOn(discordService, 'sendInfoAlert').mockResolvedValue(undefined);
    jest.spyOn(teamsService, 'sendInfoAlert').mockResolvedValue(undefined);

    await alertService.sendInfoAlert(message, metadata);

    expect(discordService.sendInfoAlert).toHaveBeenCalledWith(message, metadata);
    expect(teamsService.sendInfoAlert).toHaveBeenCalledWith(message, metadata);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    const context = 'Test context';

    // Mock the services to throw errors
    jest.spyOn(discordService, 'sendErrorAlert').mockRejectedValue(new Error('Discord error'));
    jest.spyOn(teamsService, 'sendErrorAlert').mockRejectedValue(new Error('Teams error'));

    // Should not throw
    await expect(alertService.sendErrorAlert(error, context)).resolves.not.toThrow();
  });
}); 