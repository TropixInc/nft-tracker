import { EnsPlugin, GasCostPlugin, Network, NetworkPlugin } from 'ethers';

type Options = {
  ensNetwork?: number;
  altNames?: Array<string>;
  plugins?: Array<NetworkPlugin>;
};

// See: https://chainlist.org
let injected = false;
export function injectCommonNetworks(): void {
  if (injected) {
    return;
  }
  injected = true;

  /// Register popular Ethereum networks
  function registerEth(name: string, chainId: number, options: Options): void {
    const func = function () {
      const network = new Network(name, chainId);

      // We use 0 to disable ENS
      if (options.ensNetwork != null) {
        network.attachPlugin(new EnsPlugin(null, options.ensNetwork));
      }

      network.attachPlugin(new GasCostPlugin());

      (options.plugins || []).forEach((plugin) => {
        network.attachPlugin(plugin);
      });

      return network;
    };

    // Register the network by name and chain ID
    Network.register(name, func);
    Network.register(chainId, func);

    if (options.altNames) {
      options.altNames.forEach((name) => {
        Network.register(name, func);
      });
    }
  }
  registerEth('moonbeam', 1284, {});
  registerEth('moonriver', 1285, {});
}
