export class Network{
    static async jsonRequest(url){
        console.log(`Network.jsonRequest(url) sending request to ${url}`);
        try{
            const response = await fetch(url)
            if(!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch(err){
            console.error(err);
            return null;
        }
    }
}