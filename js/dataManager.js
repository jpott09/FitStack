export class DataManager{
    constructor(data){
        this.path = [];
        this.data = data;
        this.lastSize = null;
        this.lastItems = [];
        this.lastCategories = [];
        console.log("DataManager constructor initialized");
    }
    getCategoryName(){
        // returns the first element of the path, or empty string
        let retString = this.path.length > 0 ? this.path[0] : "";
        console.log(`DataManager.getCategoryName() called\nReturning: ${retString}`);
        return retString;
    }
    _getNode(pathArray){
        let current = this.data;
        if(current == null){
            console.error("DataManager._getNode() Error\nDataManager.data is undefined.")
            return undefined;
        }
        for (let i = 0; i < pathArray.length; i++){
            const key = pathArray[i];
            if(current[key] === undefined){
                console.error(`DataManager._getNode() Error\n_getNode() was passed an invalid key ${pathArray.slice(0,i+1).join(" -> ")}`)
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
    _isObject(x){
        return x && typeof x === "object" && !Array.isArray(x);
    }
    // API: always return [categories, items]
    getRoot(clearPath = true){
        if (clearPath) {
            this.path = [];
        }
        this.lastSize = null;
        const node = this._getNode([]);
        const categories = node ? Object.keys(node).filter(k => k !== "Items") : [];
        const items = Array.isArray(node?.["Items"]) ? node["Items"].slice() : [];
        this.lastCategories = categories;
        this.lastItems = items;
        return [categories, items];
    }
    refresh(){
        // re-send the last categories and items generated from root or select
        return [this.lastCategories, this.lastItems];
    }
    select(key){
        const sizes = ['1/2"','3/4"','1"','1-1/4"','1-1/2"', '2"', '2-1/2"', '3"','4"','6"','8"','10"','12"'];
        if(sizes.includes(key)){
            this.lastSize = key;
        }
        let trial_path = [...this.path, key];
        let node = this._getNode(trial_path);
        if (node === undefined){
            console.error(`DataManager.select() Error\nselect() was passed an invalid key ${trial_path.join(" -> ")}`);
            this.lastCategories = null;
            this.lastItems = null;
            return [null, null];
        }  // invalid
        this.path = trial_path;

        if (this._isObject(node)){
            const categories = Object.keys(node).filter(k => k !== "Items");
            const items = Array.isArray(node?.["Items"]) ? node["Items"].slice() : [];
            this.lastCategories = categories;
            this.lastItems = items;
            return [categories, items];
        }
        if (Array.isArray(node)){
            this.lastCategories = [];
            this.lastItems = node.slice();
            return [[], node.slice()];
        }
        this.lastCategories = [];
        this.lastItems = [String(node)];
        return [[], [String(node)]];
    }
    back(){
        if (this.path.length) this.path.pop();
        const node = this._getNode(this.path);
        if(!this.path.includes(this.lastSize)){
            this.lastSize = null;
        }
        if (this._isObject(node)){
            const categories = Object.keys(node).filter(k => k !== "Items");
            const items = Array.isArray(node?.["Items"]) ? node["Items"].slice() : [];
            return [categories, items];
        }
        if (Array.isArray(node)){
            return [[], node.slice()];
        }
        if (node === undefined) return [null, null]; // invalid
        return [[], [String(node)]];
    }
    getPath() {
        return [...this.path];
    }
    getSize(){
        // returns the last selected size, or null if not set
        return this.lastSize;
    }
}