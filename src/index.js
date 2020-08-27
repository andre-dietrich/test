const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const Identities = require('orbit-db-identity-provider')

// optional settings for the ipfs instance
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

 // Create IPFS instance with optional config
var ipfs = null
var orbitDB = null
window.db = null
var identity = null

var doc = document.getElementById("state")


doc.innerText += "ipfs.create ... "
IPFS.create(ipfsOptions)
  .then((e) => {
    doc.innerText += " done"
    ipfs = e

    console.warn("ipfs: ", ipfs);

    doc.innerText += "\n createIdentity ... "
    Identities.createIdentity({id: 'local-id'})
      .then((e) => {
        doc.innerText += " done"
        identity = e

        console.warn("identity", identity.toJSON())
        console.warn(identity.publicKey);

        doc.innerText += "\n createInstance ... "
        OrbitDB.createInstance(ipfs, { identity: identity})
          .then((e) => {
            doc.innerText += " done"
            orbitDB = e

            doc.innerText += "\n createDB ... "
            orbitDB.docs('test-db', {
              accessController: {
                type: 'orbitdb', //OrbitDBAccessController
                write: ["*"],
              }
            })
              .then((e) => {
                window.db = e;

                doc.innerText += " done"

                doc.innerText += "\n db.load ... "
                window.db.load()
                  .then(() => {
                    doc.innerText += " done\n-------------------------"

                    doc.innerText += JSON.stringify(window.db.get(""))

                  })

                console.warn("----", window.db.address.toString())

                console.warn(window.db);
              })
          })
      })
  })
