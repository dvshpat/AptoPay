export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID // <-- replace with your real projectId from WalletConnect/AppKit
console.log(projectId)
if (!projectId) {
  throw new Error('Project ID is not defined')
}

const CONFIG = {
    MODULE_ADDRESS:
      "0xf655c6a050b44ce83e1bca5ad7207b9c50ee847f69cfc5cfdfb4f7d409b1463a",
    NODE_URL: "https://fullnode.testnet.aptoslabs.com",
  };

export const TOKEN_SYMBOL = 'APT'

export default CONFIG;