import SDKBase from 'sdk-base';
import URL from 'url';
import querystring from 'querystring';


export class Discoverer extends SDKBase {
  options;

  get check() {
    return this.options.check;
  }

  get registry() {
    return this.options.registry;
  }

  get interfaceName() {
    return this.options.interfaceName;
  }

  get methods() {
    return this.options.methods;
  }

  get group() {
    return this.options.group || '';
  }

  get version() {
    return this.options.version || '';
  }

  get protocol() {
    return this.options.protocol;
  }

  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init',
    }));
    this.options = options;
  }

  static getProviderList(addressList) {
    return addressList.map(addr => {
      const address = decodeURIComponent(escape(addr));
      const { protocol, hostname, port, query } = URL.parse(address);
      const meta = querystring.parse(query);

      return {
        protocol,
        hostname,
        port,
        meta
      };
    });
  }

  static checkMethods(providerMetaList, methods) {
    if (!methods || methods.length === 0) {
      return providerMetaList;
    }

    return providerMetaList.filter(({ meta }) => {
      const METHODS = (meta.methods || '').split(',');
      return methods.every(method => {
        return METHODS.includes(method);
      });
    });
  }

  async _init() {
    this.on('update:providers', (addressList) => {
      let providers = Discoverer.getProviderList(addressList);
      console.log('providers1======', providers);
      providers = this.filterProvider(providers);
      console.log('providers2======', providers);
      providers = Discoverer.checkMethods(providers, this.methods);
      console.log('providers3======', providers);
      this.emit('update:serverAddress', providers);
    });

    if (!this.registry || !this.registry.subscribe) {
      throw new Error('invaled options.registry');
    }

    this.registry.subscribe({
      interfaceName: this.interfaceName
    }, (addressList) => {
      console.log('=======interface:', this.interfaceName, '=====', addressList);
      this.emit('update:providers', addressList);
    });

    await this.await('update:providers');
  }

  filterProvider(providerMetaList) {
    return providerMetaList.filter(({
      meta = {
        version: '',
        group: ''
      }, protocol
    }) => {
      const version = meta.version ? meta.version : meta['default.version'];
      const group = meta.group ? meta.group : meta['default.group'];

      const isVersionMatched = !this.version || version === this.version;
      const isGroupMatched = !this.group || group === this.group;
      const isProtocolMatched = !this.protocol || protocol === (this.protocol + ':');
      console.log('filterProvider=====', `${version} === ${this.version}`,
        `${group} === ${this.group}`, `${protocol} === ${(this.protocol + ':')}`);
      return isVersionMatched && isGroupMatched && isProtocolMatched;
    });
  }
}