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

console.warn("WWWWWWWWWWWWWWWWWWWWWW", Identities);

doc.innerText += "ipfs.create ... "
IPFS.create(ipfsOptions)
  .then((e) => {
    doc.innerText += " done"
    ipfs = e

    console.warn("ipfs: ", ipfs);

    doc.innerText += "\n createIdentity ... "
    Identities.createIdentity({
      id: "0394bcdd397b997b88271ed505ef1fd2fdcb30b9bb0b0776af33ca02bf25d6a1b4",
      publicKey: "040d4e1d586e1efee5cceba5647c349c88fbf73974bf1da7ea0f8f1bf18e4a77d0ee41b9e9a9b80a9eff070202b8661c377bcc565f2368c944f27544b63371ab23",
      signatures: {
          "id": "3045022100ce9755dbb15616afab64f5dbf7494d8a2e866812b6bec61333317690370437020220204860030b023664e6f035c339bb2e8efef1daefd98cd63fa04a8cf056d4cce9",
          "publicKey": "304402206918e19ace89c28c6f7f0d14a173eb7f7a7bd380ae9ddb5bba61c1ed36db7cd7022035608d01261b9bec9708e245c555456f7b491ad9ce3c9c5d49ffe7cb3d74a0b7"
      },
      type: "orbitdb"
    })
      .then((e) => {
        doc.innerText += " done"
        identity = e

        console.warn("identity", e)
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
