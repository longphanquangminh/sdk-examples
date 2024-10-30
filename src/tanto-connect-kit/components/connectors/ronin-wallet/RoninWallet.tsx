import WillRender from '@components/will-render/WillRender';
import { DEFAULT_CONNECTORS_CONFIG } from '@sky-mavis/tanto-connect';
import React, { FC, useEffect, useState } from 'react';

import usePlatformCheck from '../../../hooks/usePlatformCheck';
import useTantoConnect from '../../../hooks/useTantoConnect';
import useConnectStore from '../../../stores/useConnectStore';
import { toDeepLinkInAppBrowser } from '../../../utils/link';
import ConnectButton from '../../connect-wallet/connect-button/ConnectButton';
import ConnectedWallet from '../../connect-wallet/connected-wallet/ConnectedWallet';
import WaitingWallet from '../../connect-wallet/waiting-wallet/WaitingWallet';

import styles from './RoninWallet.module.scss';

const roninWallet = DEFAULT_CONNECTORS_CONFIG.RONIN_WALLET;
const RoninWallet: FC = () => {
  const { handleConnect, findConnector, connectors, listenEvents, removeListeners } = useTantoConnect();
  const { connector, isConnected, setConnector } = useConnectStore();
  const { isMobile, isInAppBrowser } = usePlatformCheck();

  const [isConnecting, setIsConnecting] = useState(false);

  const connectRoninWallet = () => {
    if (isMobile && !isInAppBrowser) {
      window.location.href = toDeepLinkInAppBrowser(window.location.href);
    }

    if (connector) {
      setIsConnecting(true);
      setConnector(connector);
      handleConnect(connector)
        .catch(error => console.error('[handle_connect]', error))
        .finally(() => setIsConnecting(false));
    } else {
      console.error('Ronin Wallet connector not found.');
      window.open('https://wallet.roninchain.com', '_blank');
    }
  };

  useEffect(() => {
    const roninWalletConnector = findConnector(roninWallet.name);

    if (roninWalletConnector) {
      setConnector(roninWalletConnector);
      listenEvents(roninWalletConnector);
      roninWalletConnector.autoConnect();
    }

    return () => removeListeners(roninWalletConnector);
  }, [connectors]);

  return (
    <div className={styles.roninWallet}>
      <WillRender when={!isConnecting && !isConnected}>
        <ConnectButton onClick={connectRoninWallet} icon={roninWallet.icon} text={roninWallet.name} isRecent={true} />
      </WillRender>

      <WillRender when={isConnecting}>
        <WaitingWallet icon={roninWallet.icon} name={roninWallet.name} onCancel={() => setIsConnecting(false)} />
      </WillRender>

      <WillRender when={isConnected}>
        <ConnectedWallet />
      </WillRender>
    </div>
  );
};

export default RoninWallet;