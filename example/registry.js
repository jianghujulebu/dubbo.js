const conf = require('./config');
const { createRegistry, createRpcClient } = require('../dist');

const sleep = async (time) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

async function launch() {
  const registry = createRegistry({
    logger: console,
    zkHosts: conf.zkHost
  });

  await registry.ready();

  const rpcClient = createRpcClient({
    registry,
    interfaceName: conf.jsonPath
  });

  const consumer = rpcClient.createConsumer({
    dubboVersion: '3.0.6-SNAPSHOT',
    version: '',
    group: 'performance',
    protocol: 'jsonrpc',
    timeout: 3000,
    pool: {
      min: 2,
      max: 4,
      maxWaitingClients: 10,
      keepAlive: true
    }
  });

  // const dubboRpcClient = createRpcClient({
  //   registry,
  //   interfaceName: conf.dubboPath
  // });

  // const dubboConsumer = dubboRpcClient.createConsumer({
  //   dubboVersion: '3.0.6-SNAPSHOT',
  //   version: '',
  //   group: 'performance',
  //   protocol: 'dubbo',
  //   timeout: 3000,
  //   pool: {
  //     min: 2,
  //     max: 4,
  //     maxWaitingClients: 10,
  //     keepAlive: true
  //   }
  // });

  try {
    // await dubboConsumer.ready();

    // const reg = await dubboConsumer.invoke('registerUser', [{
    //   $class: conf.dubboClass,
    //   $: {
    //     id: {
    //       $class: 'java.lang.Long',
    //       $: 1111
    //     },
    //     name: {
    //       $class: 'java.lang.String',
    //       $: 'testdubbo'
    //     }
    //   }
    // }], [], {
    //   retry: 3
    // });

    // console.log('register', reg);

    await consumer.ready();
    const res = await consumer.invoke('findAttachments', {
      jsonrpc: '2.0',
      method: 'findAttachments',
      params: ['k1'],
      id: 1
    }, ['Dubbo-Attachments: k1=aa,k2=bb,k3=123'], {
      retry: 1
    });
    await sleep(500);
    let res1 = await consumer.invoke('findAttachments', {
      jsonrpc: '2.0',
      method: 'findAttachments',
      params: ['k2'],
      id: 1
    }, ['Dubbo-Attachments: k1=aa,k2=bb,k3=123'], {
      retry: 1
    });
    await sleep(500);
    let res3 = await consumer.invoke('findAttachments', {
      jsonrpc: '2.0',
      method: 'findAttachments',
      params: ['k3'],
      id: 1
    }, ['Dubbo-Attachments: k1=aa,k2=bb,k3=123'], {
      retry: 1
    });
    await sleep(500);
    await consumer.invoke('findAttachments', {
      jsonrpc: '2.0',
      method: 'findAttachments',
      params: ['k3'],
      id: 1
    }, ['Dubbo-Attachments: k1=aa,k2=bb,k3=123'], {
      retry: 1
    });
    await sleep(500);
    await consumer.invoke('findAttachments', {
      jsonrpc: '2.0',
      method: 'findAttachments',
      params: ['k3'],
      id: 1
    }, ['Dubbo-Attachments: k1=aa,k2=bb,k3=123'], {
      retry: 1
    });
    await sleep(500);
    await consumer.invoke('findAttachments', {
      jsonrpc: '2.0',
      method: 'findAttachments',
      params: ['k3'],
      id: 1
    }, ['Dubbo-Attachments: k1=aa,k2=bb,k3=123'], {
      retry: 1
    });
    console.log('findAttachments', res, res1, res3);
  } catch (e) {
    await registry.close();
    //await consumer.close();
    throw e;
  }

}

launch()
  .catch(console.error);