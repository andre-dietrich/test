const IPFS = require('ipfs')
window.OrbitDB = require('orbit-db')
const Identities = require('orbit-db-identity-provider')

// optional settings for the ipfs instance
const ipfsOptions = {
  //start: true,
  //repo: "repo",
  EXPERIMENTAL: {
    pubsub: true
  },
  relay: {
      enabled: true, hop: {
          enabled: true, active: true
        }
    },
  /*,
  Bootstrap: [
    "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
    "/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
    "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
    "/dns4/sfo-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z",
    "/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
    "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
    "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
    "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64"
  ],*/
  Addresses: {
    Swarm: [
      '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
    ]
  }
}

 // Create IPFS instance with optional config
window.ipfs = null
window.orbitDB = null
window.db = null
window.identity = null

var doc = document.getElementById("state")

async function connectToPeer (multiaddr, protocol = '/p2p-circuit/ipfs/') {
  try {
    await this.node.swarm.connect(protocol + multiaddr)
  } catch(e) {
    throw (e)
  }
}


async function sendMessage(topic, message) {
 try {
   const msgString = JSON.stringify(message)
   const messageBuffer = IPFS.Buffer(msgString)
   await window.ipfs.pubsub.publish(topic, messageBuffer)
 } catch (e) {
   throw (e)
 }
}

async function handlePeerConnected (ipfsPeer) {
  const ipfsId = ipfsPeer.id.toB58String()
  setTimeout(async () => {
     await sendMessage(ipfsId, { userDb: await window.ipfs.id() })
  }, 2000)
  doc.innerText += "connected to " + ipfsId + "\n"
}

function handleMessageReceived (msg) {
  doc.innerText += "msg: " + msg + "\n"
}


async function start(name){

  doc.innerText += "ipfs.create ... "
  window.ipfs = await IPFS.create(ipfsOptions)
  doc.innerText += " done"


  await window.ipfs.bootstrap.add(undefined, { default: true })
  //////////////////////////////////////////////////////////////////////////////
  doc.innerText += "\n createIdentity ... "
  window.identity = await Identities.createIdentity({id: "ssss"})
  doc.innerText += " done"

  //////////////////////////////////////////////////////////////////////////////
  doc.innerText += "\n createInstance ... "
  window.orbitDB = await window.OrbitDB.createInstance(ipfs, { identity: identity})
  doc.innerText += " done"

  //////////////////////////////////////////////////////////////////////////////
  doc.innerText += "\n createDB ... "
  window.db = await window.orbitDB.docstore(name, {
      create: name.length < 20,
      //overwrite: false,
      sync: true,
      localOnly: false,
      accessController: {
        admin: ['*'],
        write: ['*']
      }
  })
  doc.innerText += " done\n"

  await window.db.load()

  let data = await window.db.get("")

  for (i = 0; i < data.length; i++)
    doc.innerText += JSON.stringify(data[i]) + "\n"

  window.db.events.on('replicated', () => {
    const result = window.db.get("")
    console.log("ssssssssssssssssssssssssssssssssssssssssssssssssss")
  })

  await window.ipfs.libp2p.on('peer:connect', handlePeerConnected.bind(this))
  await window.ipfs.pubsub.subscribe(window.ipfs.id(), handleMessageReceived.bind(this))
}


window.start = start
