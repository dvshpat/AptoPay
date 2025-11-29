export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID // <-- replace with your real projectId from WalletConnect/AppKit
console.log(projectId)
if (!projectId) {
  throw new Error('Project ID is not defined')
}

const CONFIG = {
    MODULE_ADDRESS:
      "0x561e3de8c948305003be617b7ce5f5280aa36798ea256a8fab13fe21c2e040f4",
    NODE_URL: "https://fullnode.testnet.aptoslabs.com",
  };

export const TOKEN_SYMBOL = 'APT'

export default CONFIG;