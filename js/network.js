export class Network{
    static async jsonRequest(path){
        // guard against accidental leading slash
        const rel = path.replace(/^\//, "");
        const url = new URL(rel, document.baseURI);  // resolves against the page
        console.log("Network.jsonRequest ->", url.toString());
        const r = await fetch(url.toString(), { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    }
}