import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
interface BlockData {
  name: string;
  blockHeight: number;
  error?: string;
}
const NETWORKS = {
  ethereum: {
    name: 'Ethereum Mainnet',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: ''
  },
  sepolia: {
    name: 'Sepolia Testnet',
    apiUrl: 'https://api-sepolia.etherscan.io/api',
    apiKey: ''
  },
  holesky: {
    name: 'Holesky Testnet',
    apiUrl: 'https://api-holesky.etherscan.io/api',
    apiKey: ''
  }
};
export const LiveBlockHeight = () => {
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const fetchBlockHeight = async (network: any): Promise<BlockData> => {
    try {
      const response = await fetch(`${network.apiUrl}?module=proxy&action=eth_blockNumber&apikey=${network.apiKey}`);
      if (!response.ok) {
        return {
          name: network.name,
          blockHeight: 0,
          error: 'Network unavailable'
        };
      }
      const data = await response.json();
      if (data.result) {
        const blockHeight = parseInt(data.result, 16);
        return {
          name: network.name,
          blockHeight
        };
      }
      return {
        name: network.name,
        blockHeight: 0,
        error: 'Invalid response'
      };
    } catch (error) {
      return {
        name: network.name,
        blockHeight: 0,
        error: 'Fetch error'
      };
    }
  };
  const fetchAllBlockHeights = async () => {
    setIsLoading(true);
    try {
      const promises = Object.values(NETWORKS).map(network => fetchBlockHeight(network));
      const results = await Promise.all(promises);
      setBlockData(results);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching block heights:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Initial fetch
    fetchAllBlockHeights();

    // Set up interval to refresh every 12 seconds
    const interval = setInterval(fetchAllBlockHeights, 12000);
    return () => clearInterval(interval);
  }, []);
  const getStatusColor = (blockData: BlockData) => {
    if (blockData.error) return 'destructive';
    return 'default';
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          📦 Live Block Heights
          {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blockData.map((network, index) => (
            <div key={index} className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <h3 className="font-medium text-sm text-center mb-2">{network.name}</h3>
              {network.error ? (
                <Badge variant="destructive" className="text-xs">
                  {network.error}
                </Badge>
              ) : (
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    #{network.blockHeight.toLocaleString()}
                  </div>
                  <Badge variant="default" className="text-xs mt-1">
                    Live
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center mt-4">
          Last updated: {lastUpdate.toLocaleTimeString()} • Updates every 12 seconds
        </div>
      </CardContent>
    </Card>
  );
};
