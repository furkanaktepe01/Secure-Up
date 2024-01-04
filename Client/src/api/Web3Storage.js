import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'

export const chunkSize = 500000;

const NFT_STORAGE_KEY = process.env.REACT_APP_NFT_STORAGE_KEY;

export const storeFiles = async (files) => {  
    
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    const cid = await nftstorage.storeDirectory(files);

    return cid;
}

export const linkify = (cid, no) => {

  return `https://gateway.pinata.cloud/ipfs/${cid}/${ no ? `${no}.json` : "" }`;
}

