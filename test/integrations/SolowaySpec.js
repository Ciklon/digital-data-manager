import assert from 'assert';
import sinon from 'sinon';
import reset from './../reset.js';
import Soloway from './../../src/integrations/Soloway.js';
import ddManager from './../../src/ddManager.js';

describe('Integrations: Soloway', () => {
  let soloway;
  const options = {
    siteId: '123',
  };

  beforeEach(() => {
    window.digitalData = {
      website: {},
      page: {},
      user: {
        email: 'test@driveback.ru'
      },
      events: []
    };
    soloway = new Soloway(window.digitalData, options);
    ddManager.addIntegration('Soloway', soloway);
  });

  afterEach(() => {
    soloway.reset();
    ddManager.reset();
    reset();
  });

  describe('before loading', () => {

    describe('#constructor', () => {
      it('should add proper  options', () => {
        assert.equal(options.siteId, soloway.getOption('siteId'));
      });
    });

    describe('#initialize', () => {
      it('should initialize criteo queue object', () => {
        ddManager.initialize({
          sendViewedPageEvent: false,
        });
        assert.ok(window.AdriverCounter);
      });
    });

  });

  describe('after loading', () => {

    beforeEach((done) => {
      ddManager.once('ready', () => {
        sinon.stub(window.AdriverCounter, 'request');
        done();
      });
      ddManager.initialize({
        sendViewedPageEvent: false,
      });
    });

    afterEach(() => {
      if (window.AdriverCounter.request.restore) {
        window.AdriverCounter.request.restore();
      }
    });

    describe('#General Tracker', () => {

      it('should track general page', (done) => {
        window.digitalData.events.push({
          name: 'Viewed Page',
          callback: () => {
            setTimeout(() => {
              assert.ok(!window.AdriverCounter.items[0]);
              assert.ok(window.AdriverCounter.request.calledOnce);
              // assert.ok(window.AdriverCounter.request.calledWith(
              //   'custom=153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
              // ));
              done();
            }, 101);
          }
        });
      });

      it('should NOT track general page', (done) => {
        window.digitalData.events.push({
          name: 'Viewed Page',
        });
        window.digitalData.events.push({
          name: 'Viewed Product Detail',
          product: {
            id: 'pr123',
            categoryId: 'cart123',
          },
          callback: () => {
            setTimeout(() => {
              assert.ok(!window.AdriverCounter.items[0]);
              assert.ok(window.AdriverCounter.request.calledOnce);
              assert.ok(!window.AdriverCounter.request.calledWith(
                'custom=153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
              ));
              done();
            }, 101);
          }
        });
      });

    });


    describe('#Product Page Tracker', () => {

      it('it should track product page', (done) => {
        window.digitalData.events.push({
          name: 'Viewed Product Detail',
          product: {
            id: 'pr123',
            categoryId: 'cart123',
          },
          callback: () => {
            assert.ok(!window.AdriverCounter.items[0]);
            assert.ok(window.AdriverCounter.request.calledOnce);
            assert.ok(window.AdriverCounter.request.calledWith(
              'custom=10%3Dpr123%3B11%3Dcart123%3B153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
            ));
            done();
          }
        });
      });

    });


    describe('#Add Product Tracker', () => {

      it('it should track added product', (done) => {
        window.digitalData.events.push({
          name: 'Added Product',
          product: {
            id: 'pr123',
            categoryId: 'cart123',
          },
          callback: () => {
            assert.ok(!window.AdriverCounter.items[0]);
            assert.ok(window.AdriverCounter.request.calledOnce);
            assert.ok(window.AdriverCounter.request.calledWith(
              'sz=add_basket&custom=10%3Dpr123%3B11%3Dcart123%3B153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
            ));
            done();
          }
        });
      });

    });

    describe('#Remove Product Tracker', () => {

      it('it should track removed product', (done) => {
        window.digitalData.events.push({
          name: 'Removed Product',
          product: {
            id: 'pr123',
            categoryId: 'cart123',
          },
          callback: () => {
            assert.ok(!window.AdriverCounter.items[0]);
            assert.ok(window.AdriverCounter.request.calledOnce);
            assert.ok(window.AdriverCounter.request.calledWith(
              'sz=del_basket&custom=10%3Dpr123%3B11%3Dcart123%3B153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
            ));
            done();
          }
        });
      });

    });

    describe('#Order Confirmation Tracker', () => {

      it('it should track completed transaction', (done) => {
        window.digitalData.events.push({
          name: 'Completed Transaction',
          transaction: {
            orderId: 'ord123',
            total: 1000,
          },
          callback: () => {
            assert.ok(!window.AdriverCounter.items[0]);
            assert.ok(window.AdriverCounter.request.calledOnce);
            assert.ok(window.AdriverCounter.request.calledWith(
              'sz=order&custom=150%3Dord123%3B151%3D1000%3B153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
            ));
            done();
          }
        });
      });

    });

    describe('#Registration Tracker', () => {

      it('it should track registered user', (done) => {
        window.digitalData.events.push({
          name: 'Registered',
          user: {
            userId: 'u123',
          },
          callback: () => {
            assert.ok(!window.AdriverCounter.items[0]);
            assert.ok(window.AdriverCounter.request.calledOnce);
            assert.ok(window.AdriverCounter.request.calledWith(
              'sz=regist&custom=152%3Du123%3B153%3D8cc94f335003012e00e1441e5666756f&sid=123&bt=62&ph=1'
            ));
            done();
          }
        });
      });

    });

  });
});
