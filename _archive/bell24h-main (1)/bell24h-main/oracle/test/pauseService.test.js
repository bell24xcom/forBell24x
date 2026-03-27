const { expect } = require('chai');
const sinon = require('sinon');
const pauseService = require('../src/services/pauseService');
const { ethers } = require('ethers');

describe('Pause Service', () => {
  let mockContract;
  let mockSigner;
  let mockEventEmitter;
  let mockListeners;
  
  beforeEach(() => {
    // Reset the pause service state
    pauseService._resetForTest();
    
    // Mock contract with pause methods
    mockContract = {
      paused: sinon.stub().resolves(false),
      pause: sinon.stub().resolves({
        wait: sinon.stub().resolves({})
      }),
      unpause: sinon.stub().resolves({
        wait: sinon.stub().resolves({})
      }),
      hasRole: sinon.stub().resolves(true),
      PAUSER_ROLE: sinon.stub().resolves(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('PAUSER_ROLE')))
    };
    
    // Mock signer
    mockSigner = {
      getAddress: sinon.stub().resolves('0x1234567890123456789012345678901234567890')
    };
    
    // Mock event emitter for contract events
    mockEventEmitter = {
      on: sinon.stub(),
      removeAllListeners: sinon.stub()
    };
    
    // Track registered listeners
    mockListeners = [];
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('initialization', () => {
    it('should initialize in non-paused state by default', async () => {
      await pauseService.initialize(mockContract, mockSigner);
      expect(pauseService.isPausedState()).to.be.false;
    });
    
    it('should initialize paused state from contract', async () => {
      // Mock contract to return paused=true
      mockContract.paused.resolves(true);
      
      await pauseService.initialize(mockContract, mockSigner);
      expect(pauseService.isPausedState()).to.be.true;
      
      // Check status details
      const status = pauseService.getPauseStatus();
      expect(status.paused).to.be.true;
      expect(status.reason).to.equal('Initialized paused from contract');
      expect(status.source).to.equal('contract');
      expect(status.timestamp).to.be.a('number');
    });
    
    it('should register event listeners for contract pause/unpause events', async () => {
      mockContract.interface = {
        getEvent: sinon.stub().returns({ format: () => {} })
      };
      mockContract.on = sinon.stub();
      
      await pauseService.initialize(mockContract, mockSigner);
      
      // Verify event listeners were set up
      expect(mockContract.on.calledTwice).to.be.true;
      expect(mockContract.on.firstCall.args[0]).to.equal('Paused');
      expect(mockContract.on.secondCall.args[0]).to.equal('Unpaused');
    });
  });
  
  describe('pause functionality', () => {
    beforeEach(async () => {
      await pauseService.initialize(mockContract, mockSigner);
    });
    
    it('should pause the service', async () => {
      const reason = 'Testing pause';
      const result = await pauseService.pause(reason, 'test');
      
      expect(result).to.be.true;
      expect(pauseService.isPausedState()).to.be.true;
      
      const status = pauseService.getPauseStatus();
      expect(status.paused).to.be.true;
      expect(status.reason).to.equal(reason);
      expect(status.source).to.equal('test');
    });
    
    it('should attempt to pause the contract if oracle has pauser role', async () => {
      await pauseService.pause('Testing pause', 'test');
      
      expect(mockContract.pause.calledOnce).to.be.true;
      expect(mockContract.pause().wait.calledOnce).to.be.true;
    });
    
    it('should still pause the service if contract pause fails', async () => {
      // Mock contract pause to fail
      mockContract.pause.rejects(new Error('Access denied'));
      
      const result = await pauseService.pause('Testing pause', 'test');
      
      // Service should still be paused
      expect(result).to.be.true;
      expect(pauseService.isPausedState()).to.be.true;
    });
    
    it('should not pause if already paused', async () => {
      // First pause
      await pauseService.pause('Initial pause', 'test');
      
      // Reset mocks to check calls
      mockContract.pause.reset();
      
      // Try to pause again
      const result = await pauseService.pause('Second pause', 'test');
      
      // Should return false and not call contract pause again
      expect(result).to.be.false;
      expect(mockContract.pause.called).to.be.false;
    });
    
    it('should notify listeners when paused', async () => {
      const listener = sinon.spy();
      pauseService.onPauseStateChange(listener);
      
      await pauseService.pause('Testing listener', 'test');
      
      expect(listener.calledOnce).to.be.true;
      expect(listener.firstCall.args[0]).to.be.true; // paused state
      expect(listener.firstCall.args[1]).to.deep.include({
        reason: 'Testing listener',
        source: 'test'
      });
    });
  });
  
  describe('unpause functionality', () => {
    beforeEach(async () => {
      await pauseService.initialize(mockContract, mockSigner);
      await pauseService.pause('Initial pause for test', 'test');
    });
    
    it('should unpause the service', async () => {
      const reason = 'Testing unpause';
      const result = await pauseService.unpause(reason, 'test');
      
      expect(result).to.be.true;
      expect(pauseService.isPausedState()).to.be.false;
    });
    
    it('should attempt to unpause the contract if oracle has pauser role', async () => {
      await pauseService.unpause('Testing unpause', 'test');
      
      expect(mockContract.unpause.calledOnce).to.be.true;
      expect(mockContract.unpause().wait.calledOnce).to.be.true;
    });
    
    it('should still unpause the service if contract unpause fails', async () => {
      // Mock contract unpause to fail
      mockContract.unpause.rejects(new Error('Access denied'));
      
      const result = await pauseService.unpause('Testing unpause', 'test');
      
      // Service should still be unpaused
      expect(result).to.be.true;
      expect(pauseService.isPausedState()).to.be.false;
    });
    
    it('should not unpause if already unpaused', async () => {
      // First unpause
      await pauseService.unpause('Initial unpause', 'test');
      
      // Reset mocks to check calls
      mockContract.unpause.reset();
      
      // Try to unpause again
      const result = await pauseService.unpause('Second unpause', 'test');
      
      // Should return false and not call contract unpause again
      expect(result).to.be.false;
      expect(mockContract.unpause.called).to.be.false;
    });
    
    it('should notify listeners when unpaused', async () => {
      const listener = sinon.spy();
      pauseService.onPauseStateChange(listener);
      
      await pauseService.unpause('Testing listener', 'test');
      
      expect(listener.calledOnce).to.be.true;
      expect(listener.firstCall.args[0]).to.be.false; // unpaused state
      expect(listener.firstCall.args[1]).to.deep.include({
        reason: 'Testing listener',
        source: 'test'
      });
    });
  });
  
  describe('event handling', () => {
    beforeEach(async () => {
      mockContract.on = (event, callback) => {
        mockListeners.push({ event, callback });
      };
      
      await pauseService.initialize(mockContract, mockSigner);
    });
    
    it('should update pause state when receiving contract Paused event', async () => {
      // Find and trigger the Paused event handler
      const pausedEventHandler = mockListeners.find(l => l.event === 'Paused');
      expect(pausedEventHandler).to.exist;
      
      // Service should start unpaused
      expect(pauseService.isPausedState()).to.be.false;
      
      // Trigger Paused event
      await pausedEventHandler.callback('0x1234567890123456789012345678901234567890');
      
      // Service should now be paused
      expect(pauseService.isPausedState()).to.be.true;
      
      // Check pause status
      const status = pauseService.getPauseStatus();
      expect(status.paused).to.be.true;
      expect(status.source).to.equal('contract');
    });
    
    it('should update pause state when receiving contract Unpaused event', async () => {
      // First pause the service
      await pauseService.pause('Testing', 'test');
      expect(pauseService.isPausedState()).to.be.true;
      
      // Find and trigger the Unpaused event handler
      const unpausedEventHandler = mockListeners.find(l => l.event === 'Unpaused');
      expect(unpausedEventHandler).to.exist;
      
      // Trigger Unpaused event
      await unpausedEventHandler.callback('0x1234567890123456789012345678901234567890');
      
      // Service should now be unpaused
      expect(pauseService.isPausedState()).to.be.false;
      
      // Check status
      const status = pauseService.getPauseStatus();
      expect(status.paused).to.be.false;
      expect(status.source).to.equal('contract');
    });
  });
  
  describe('listener management', () => {
    beforeEach(async () => {
      await pauseService.initialize(mockContract, mockSigner);
    });
    
    it('should allow registration and unregistration of pause state listeners', () => {
      const listener = sinon.spy();
      
      // Register listener
      const unregister = pauseService.onPauseStateChange(listener);
      
      // Pause to trigger listener
      pauseService.pause('Testing listeners', 'test');
      
      expect(listener.calledOnce).to.be.true;
      
      // Unregister and verify it's not called again
      unregister();
      listener.reset();
      
      pauseService.unpause('Testing listeners again', 'test');
      expect(listener.called).to.be.false;
    });
  });
});
