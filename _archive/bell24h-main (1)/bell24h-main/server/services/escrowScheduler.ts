import { PrismaClient } from '@prisma/client';
import { escrowService } from './escrowService';
import { emailService } from './emailService';
import { format } from 'date-fns';

const prisma = new PrismaClient();

class EscrowScheduler {
  private isRunning = false;
  private checkInterval = 5 * 60 * 1000; // Check every 5 minutes
  private timer: NodeJS.Timeout | null = null;

  /**
   * Start the escrow scheduler
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Escrow scheduler started');
    this.checkAndProcessReleases();
  }

  /**
   * Stop the escrow scheduler
   */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('Escrow scheduler stopped');
  }

  /**
   * Check for and process any pending escrow releases
   */
  private async checkAndProcessReleases() {
    if (!this.isRunning) return;

    try {
      const now = new Date();
      
      // Find all escrow holds that are due for release
      const holdsToRelease = await prisma.escrowHold.findMany({
        where: {
          status: 'HELD_IN_ESCROW',
          releaseDate: {
            lte: now,
          },
        },
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Process each hold
      for (const hold of holdsToRelease) {
        try {
          console.log(`Automatically releasing escrow hold ${hold.id}`);
          
          // Release the escrow
          const result = await escrowService.releaseEscrow(hold.id, {
            action: 'scheduled_release',
            automated: true,
          });

          // Send notification
          if (result && hold.wallet.user?.email) {
            await this.sendReleaseNotification(hold);
          }
        } catch (error) {
          console.error(`Error processing escrow hold ${hold.id}:`, error);
          // TODO: Implement retry mechanism or alerting for failed releases
        }
      }
    } catch (error) {
      console.error('Error in escrow scheduler:', error);
    } finally {
      // Schedule the next check
      if (this.isRunning) {
        this.timer = setTimeout(() => this.checkAndProcessReleases(), this.checkInterval);
      }
    }
  }

  /**
   * Send email notification for released escrow
   */
  private async sendReleaseNotification(hold: any) {
    try {
      const { wallet } = hold;
      const user = wallet.user;
      
      const emailData = {
        to: user.email,
        subject: `Escrow Funds Released - ${hold.referenceId}`,
        template: 'escrow-released',
        context: {
          name: user.name || 'Customer',
          amount: (hold.amount / 100).toFixed(2),
          currency: hold.currency,
          referenceId: hold.referenceId,
          releaseDate: format(new Date(), 'MMMM d, yyyy HH:mm:ss'),
          orderId: hold.orderId || 'N/A',
          supportEmail: 'support@yourdomain.com',
        },
      };

      await emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Failed to send escrow release notification:', error);
      // Don't throw to avoid blocking the release process
    }
  }
}

export const escrowScheduler = new EscrowScheduler();
