import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Escrow } from '../typechain-types';

describe('Escrow', () => {
  let escrow: Escrow;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let feeCollector: SignerWithAddress;
  const platformFee = 100; // 1%
  const transactionAmount = ethers.utils.parseEther('1.0');

  beforeEach(async () => {
    [owner, buyer, supplier, feeCollector] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory('Escrow');
    escrow = await Escrow.deploy(feeCollector.address, platformFee);
    await escrow.deployed();
  });

  describe('Deployment', () => {
    it('should set the correct fee collector and platform fee', async () => {
      expect(await escrow.feeCollector()).to.equal(feeCollector.address);
      expect(await escrow.platformFee()).to.equal(platformFee);
    });

    it('should set the correct owner', async () => {
      expect(await escrow.owner()).to.equal(owner.address);
    });
  });

  describe('Transaction Management', () => {
    it('should create a new transaction', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      const transaction = await escrow.transactions(1);
      expect(transaction.buyer).to.equal(buyer.address);
      expect(transaction.supplier).to.equal(supplier.address);
      expect(transaction.amount).to.equal(transactionAmount);
      expect(transaction.status).to.equal(0); // PENDING
    });

    it('should release funds to supplier', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      const initialSupplierBalance = await supplier.getBalance();
      await escrow.connect(buyer).releaseFunds(1);
      const finalSupplierBalance = await supplier.getBalance();

      const transaction = await escrow.transactions(1);
      expect(transaction.status).to.equal(1); // COMPLETED
      expect(finalSupplierBalance.sub(initialSupplierBalance)).to.equal(
        transactionAmount.mul(10000 - platformFee).div(10000)
      );
    });

    it('should refund funds to buyer', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      const initialBuyerBalance = await buyer.getBalance();
      await escrow.connect(buyer).refund(1);
      const finalBuyerBalance = await buyer.getBalance();

      const transaction = await escrow.transactions(1);
      expect(transaction.status).to.equal(2); // REFUNDED
      expect(finalBuyerBalance.sub(initialBuyerBalance)).to.equal(transactionAmount);
    });

    it('should raise a dispute', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await escrow.connect(buyer).raiseDispute(1, 'Test dispute reason');
      const transaction = await escrow.transactions(1);
      expect(transaction.status).to.equal(3); // DISPUTED
    });

    it('should resolve a dispute', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await escrow.connect(buyer).raiseDispute(1, 'Test dispute reason');
      await escrow.connect(owner).resolveDispute(1, true);

      const transaction = await escrow.transactions(1);
      expect(transaction.status).to.equal(1); // COMPLETED
    });
  });

  describe('Fee Management', () => {
    it('should collect platform fees correctly', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      const initialFeeCollectorBalance = await feeCollector.getBalance();
      await escrow.connect(buyer).releaseFunds(1);
      const finalFeeCollectorBalance = await feeCollector.getBalance();

      expect(finalFeeCollectorBalance.sub(initialFeeCollectorBalance)).to.equal(
        transactionAmount.mul(platformFee).div(10000)
      );
    });

    it('should allow owner to update platform fee', async () => {
      const newFee = 200; // 2%
      await escrow.connect(owner).updatePlatformFee(newFee);
      expect(await escrow.platformFee()).to.equal(newFee);
    });

    it('should allow owner to update fee collector', async () => {
      const newFeeCollector = await ethers.getSigner(4);
      await escrow.connect(owner).updateFeeCollector(newFeeCollector.address);
      expect(await escrow.feeCollector()).to.equal(newFeeCollector.address);
    });
  });

  describe('Access Control', () => {
    it('should only allow buyer to release funds', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await expect(
        escrow.connect(supplier).releaseFunds(1)
      ).to.be.revertedWith('Only buyer can release funds');
    });

    it('should only allow buyer to refund', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await expect(
        escrow.connect(supplier).refund(1)
      ).to.be.revertedWith('Only buyer can refund');
    });

    it('should only allow buyer to raise dispute', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await expect(
        escrow.connect(supplier).raiseDispute(1, 'Test dispute reason')
      ).to.be.revertedWith('Only buyer can raise dispute');
    });

    it('should only allow owner to resolve dispute', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await escrow.connect(buyer).raiseDispute(1, 'Test dispute reason');

      await expect(
        escrow.connect(buyer).resolveDispute(1, true)
      ).to.be.revertedWith('Only owner can resolve dispute');
    });

    it('should only allow owner to update platform fee', async () => {
      await expect(
        escrow.connect(buyer).updatePlatformFee(200)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should only allow owner to update fee collector', async () => {
      await expect(
        escrow.connect(buyer).updateFeeCollector(feeCollector.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Events', () => {
    it('should emit TransactionCreated event', async () => {
      await expect(
        escrow.connect(buyer).createTransaction(supplier.address, {
          value: transactionAmount,
        })
      )
        .to.emit(escrow, 'TransactionCreated')
        .withArgs(1, buyer.address, supplier.address, transactionAmount);
    });

    it('should emit FundsReleased event', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await expect(escrow.connect(buyer).releaseFunds(1))
        .to.emit(escrow, 'FundsReleased')
        .withArgs(1, buyer.address, supplier.address, transactionAmount);
    });

    it('should emit DisputeRaised event', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await expect(escrow.connect(buyer).raiseDispute(1, 'Test dispute reason'))
        .to.emit(escrow, 'DisputeRaised')
        .withArgs(1, buyer.address, supplier.address, 'Test dispute reason');
    });

    it('should emit DisputeResolved event', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await escrow.connect(buyer).raiseDispute(1, 'Test dispute reason');

      await expect(escrow.connect(owner).resolveDispute(1, true))
        .to.emit(escrow, 'DisputeResolved')
        .withArgs(1, buyer.address, supplier.address, true);
    });
  });

  describe('Edge Cases', () => {
    it('should not allow creating transaction with zero amount', async () => {
      await expect(
        escrow.connect(buyer).createTransaction(supplier.address, {
          value: 0,
        })
      ).to.be.revertedWith('Amount must be greater than 0');
    });

    it('should not allow releasing funds for non-existent transaction', async () => {
      await expect(
        escrow.connect(buyer).releaseFunds(999)
      ).to.be.revertedWith('Transaction does not exist');
    });

    it('should not allow releasing funds for completed transaction', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await escrow.connect(buyer).releaseFunds(1);

      await expect(
        escrow.connect(buyer).releaseFunds(1)
      ).to.be.revertedWith('Transaction is not pending');
    });

    it('should not allow raising dispute for completed transaction', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await escrow.connect(buyer).releaseFunds(1);

      await expect(
        escrow.connect(buyer).raiseDispute(1, 'Test dispute reason')
      ).to.be.revertedWith('Transaction is not pending');
    });

    it('should not allow resolving dispute for non-disputed transaction', async () => {
      await escrow.connect(buyer).createTransaction(supplier.address, {
        value: transactionAmount,
      });

      await expect(
        escrow.connect(owner).resolveDispute(1, true)
      ).to.be.revertedWith('Transaction is not disputed');
    });
  });
}); 