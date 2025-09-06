export class List{
    /*
    loading saving behaviour:
    list is always held as 'tempList'
    list will autosave as 'tempList'
    a manual save will prompt for a list name and save a SNAPSHOT of the current list
    a loaded list will replace the current list, and be held as the current 'tempList'
    TLDR: List names ONLY apply to saved snapshots, not the current working list.
    */
    constructor(){
        this.defaultName = "Temporary List";
        this.name = this.defaultName;
        this.loadedListName = this.defaultName;
        try {
            this.items = JSON.parse(localStorage.getItem(this.name)) || {};
        } catch {
            this.items = {};
        }
    }
    load(listName){
        let data;
        try { data = JSON.parse(localStorage.getItem(listName)); } catch { data = null; }
        if (data && typeof data === "object" && !Array.isArray(data)) {
            // save current items as temp list first
            localStorage.setItem(this.name, JSON.stringify(this.items));
            // apply loaded data to current items
            this.items = data;
            this.loadedListName = listName;
            return true;
        }
        return false;
    }
    save(listName){
        if (!listName || !listName.trim()) return false;
        localStorage.setItem(listName, JSON.stringify(this.items));
        this.loadedListName = listName;
        return true;
    }
    addItem(itemName, quantity){
        this.loadedListName = this.defaultName; // adding an item means we're working on a temp list
        const q = Number(quantity) || 0;
        this.items[itemName] = (this.items[itemName] || 0) + q;
        if(this.items[itemName] < 1) this.deleteItem(itemName);
        localStorage.setItem(this.name, JSON.stringify(this.items));
    }
    deleteItem(itemName){
        if(Object.hasOwn(this.items, itemName)){
            delete this.items[itemName];
        }
        localStorage.setItem(this.name, JSON.stringify(this.items));
    }
    clearList(){
        this.items = {};
        this.loadedListName = this.defaultName;
        localStorage.setItem(this.name, JSON.stringify(this.items));
    }
    getItems(){
        // sort items by the first character only
        const sortedItems = Object.entries(this.items).sort(([a], [b]) => a.localeCompare(b));
        return Object.fromEntries(sortedItems);
    }
    getItemQuantity(itemName){
        return this.items[itemName] || 0;
    }
    getLoadedListName(){
        return this.loadedListName;
    }
    getSavedListNames(){
        return Object.keys(localStorage);
    }
    deleteList(listName){
        if (!listName || !listName.trim()) return false;
        localStorage.removeItem(listName);
        return true;
    }
}