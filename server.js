const mDnsSd = require('node-dns-sd');
const LinkSmartThingDirectory = require('link_smart_thing_directory');

main();

async function main(){

    const directorySearchApiPromise = new Promise ((myResolve, myReject) => {
        mDnsSd.discover({
            name: '_wot._tcp.local'
            }).then((device_list) =>{
                const directory = {address:"127.0.0.1", port:8081};  
                device_list.forEach(element => { // only one directory handled for now, defaults to 127.0.0.1:8081
                    directory.address = element.address;
                    directory.port = element.service.port; 
                });
                const apiClient = new LinkSmartThingDirectory.ApiClient(directory.address+":"+directory.port);
                myResolve(apiClient);
            }).catch((error) => {
            console.error(error);
            myReject(error);
            });

    })
    directorySearchApiPromise.then( (apiClient) => {
        const searchApi = new LinkSmartThingDirectory.SearchApi(apiClient);
        const thingsApi = new LinkSmartThingDirectory.ThingsApi(apiClient);
        //searchApi.searchXpathGet
        searchApi.searchJsonpathGet("$[:].id", (error, data,response ) => {
            if (error) {
                console.error(error);
                // myReject(error);
            } else {
                //myResolve(JSON.parse(response.text)[0]);
                console.log("Response ",  JSON.parse(response.text));
                const myArray = JSON.parse(response.text);
                for ( let uuid of myArray ) {
                    thingsApi.thingsIdDelete(uuid, (err, dat, resp) => {
                        if (err) {
                            console.error(err);
                        }
                        else {
                            console.log("Deleted ", uuid);
                        }
                    });

                }


            }
        })
    } )
}