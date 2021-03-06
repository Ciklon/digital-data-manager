import Integration from './../Integration.js';
import deleteProperty from './../functions/deleteProperty.js';

class GoogleTagManager extends Integration {

  constructor(digitalData, options) {
    const optionsWithDefaults = Object.assign({
      containerId: null,
      noConflict: false,
    }, options);
    super(digitalData, optionsWithDefaults);
    this.addTag({
      type: 'script',
      attr: {
        src: `//www.googletagmanager.com/gtm.js?id=${options.containerId}&l=dataLayer`,
      },
    });
  }

  allowCustomEvents() {
    return true;
  }

  initialize() {
    window.dataLayer = window.dataLayer || [];
    this.ddManager.on('ready', () => {
      window.dataLayer.push({ event: 'DDManager Ready' });
    });
    this.ddManager.on('load', () => {
      window.dataLayer.push({ event: 'DDManager Loaded' });
    });
    if (this.getOption('containerId') && this.getOption('noConflict') === false) {
      window.dataLayer.push({ 'gtm.start': Number(new Date()), event: 'gtm.js' });
      this.load(this.onLoad);
    } else {
      this.onLoad();
    }
  }

  isLoaded() {
    return !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push);
  }

  reset() {
    deleteProperty(window, 'dataLayer');
    deleteProperty(window, 'google_tag_manager');
  }

  trackEvent(event) {
    const dlEvent = Object.assign({}, event);
    const name = dlEvent.name;
    const category = dlEvent.category;
    deleteProperty(dlEvent, 'name');
    deleteProperty(dlEvent, 'category');
    dlEvent.event = name;
    dlEvent.eventCategory = category;
    window.dataLayer.push(dlEvent);
  }
}

export default GoogleTagManager;
