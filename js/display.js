import { DataManager } from "./dataManager.js";
import { List } from "./list.js";

export class Display{

    constructor(document,data,wipe_storage=false){
        this.document = document;
        this.body = this.document.body;
        this.headerDiv = null;
        this.bodyDiv = null;
        this.list = new List();
        this.dataManager = new DataManager(data);
        this.quantityPrepend = "Quantity:";
        if(wipe_storage){localStorage.clear(); sessionStorage.clear();};
        console.log("Display constructor initialized");
        // entry point
        this.createDivs();
        this.displayBody();
    }
    // -------------------------------------------------
    // DIV MANAGEMENT
    // -------------------------------------------------
    createDivs(){
        this.headerDiv = this.document.createElement("div");
        this.headerDiv.classList.add("headerDiv");
        this.bodyDiv = this.document.createElement("div");
        this.bodyDiv.classList.add("bodyDiv");
        this.body.appendChild(this.headerDiv);
        this.body.appendChild(this.bodyDiv);
    }
    clearHeaderDiv(){
        this.headerDiv.innerHTML = "";
    }
    clearBodyDiv(){
        this.bodyDiv.innerHTML = "";
    }
    // -------------------------------------------------
    // DISPLAY FUNCTIONS
    // -------------------------------------------------
    displayPath(){
        let pathList = this.dataManager.getPath();
        this.clearHeaderDiv();
        const pathElement = this._pathElement("Home");
        this.headerDiv.appendChild(pathElement);
        pathList.forEach((name) => {
            const pathElement = this._pathElement(name);
            this.headerDiv.appendChild(pathElement);
        });
    }
    displayBody(filter = null){
        // if no filter, we show root
        this.clearBodyDiv();
        let categories = [];
        let items = [];
        if(!filter){
            [categories, items] = this.dataManager.getRoot();
            this.bodyDiv.appendChild(this._listElement());
        }else if(filter == "refresh"){
            [categories, items] = this.dataManager.refresh();
            // show back if path, else list
            if(this.dataManager.getPath().length > 0){
                this.bodyDiv.appendChild(this._backElement());
            }else{
                this.bodyDiv.appendChild(this._listElement());
            }
        }else{
            // added check here for null, null, and defaults to root path display if so
            [categories, items] = this.dataManager.select(filter) || [null,null];
            if(categories === null){this.displayPath(); return;}
            this.bodyDiv.appendChild(this._backElement());
        }
        this.displayPath(); // update path AFTER calling dataManager
        categories.forEach(category => {
            const categoryElement = this._categoryElement(category);
            this.bodyDiv.appendChild(categoryElement);
        });
        items.forEach(item => {
            const lastSize = this.dataManager.getSize();
            let displayName = item;
            if(lastSize){
                let compareSize = lastSize.replace(/"/g, "");
                // if displayName starts with lastSize (remove the double quotes before compare) then we don't add lastSize
                if(!displayName.startsWith(compareSize)){
                    // insert category but only if the category name is not already present
                    if(!displayName.includes(this.dataManager.getCategoryName())){
                        displayName = `${lastSize} ${this.dataManager.getCategoryName()} ${item}`;
                    }else{
                        // we still add the size if its not already present
                        if(!displayName.includes(lastSize)){
                            displayName = `${lastSize} ${displayName}`;
                        }
                    }
                }
                else{
                    // if displayName contains a size, we need to insert the category name
                    // but only if the category name is not already present
                    if(!displayName.includes(this.dataManager.getCategoryName())){
                        let lastQuoteIndex = displayName.lastIndexOf("\"");
                        if(lastQuoteIndex !== -1){
                            displayName = `${displayName.slice(0, lastQuoteIndex)}\" ${this.dataManager.getCategoryName()} ${displayName.slice(lastQuoteIndex + 1)}`;
                        }
                    }
                }
            }
            const itemElement = this._itemElement(displayName);
            this.bodyDiv.appendChild(itemElement);
        });
    }
    displayItem(item){
        this.clearBodyDiv();
        this.bodyDiv.appendChild(this._itemBackElement());
        this.bodyDiv.appendChild(this._infoElement(item));
        this.bodyDiv.appendChild(this._infoElement(`Quantity in List: ${this.list.getItemQuantity(item)}`))
        const buttonDiv = this.document.createElement("div");
        buttonDiv.classList.add("horizontalDiv");
        const quantityElement = this._quantityElement();
        //quantityElement.classList.add("horizontalElement");
        quantityElement.classList.add("element");
        quantityElement.classList.add("infoElement");
        const minusOneElement = this._minusElement(quantityElement, 1);
        minusOneElement.classList.add("horizontalElement");
        const plusOneElement = this._plusElement(quantityElement, 1);
        plusOneElement.classList.add("horizontalElement");
        this.bodyDiv.appendChild(quantityElement);
        this.bodyDiv.appendChild(buttonDiv);
        buttonDiv.appendChild(minusOneElement);
        buttonDiv.appendChild(plusOneElement);
        this.bodyDiv.appendChild(this._acceptElement(item));
    }
    displayList(listName = null){
        this.clearHeaderDiv();
        this.clearBodyDiv();
        // load the list
        if(listName){
            let loaded = this.list.load(listName);
            if(!loaded){
                console.error(`Failed to load list: ${listName}`);
            }
        }
        // add 'home' back to header div
        const homeElement = this._pathElement("Home");
        this.headerDiv.appendChild(homeElement);
        // add back button to body div
        this.bodyDiv.appendChild(this._customBackElement(this.displayBody.bind(this),[]));
        // load and save buttons in horizontal div
        const buttonDiv = this.document.createElement("div");
        const infoElement = this._infoElement(`\"${this.list.getLoadedListName()}\" - Items:`);
        buttonDiv.classList.add("listManagementDiv");
        buttonDiv.appendChild(this._loadSavedListsElement());
        buttonDiv.appendChild(this._saveListElement(infoElement));
        this.bodyDiv.appendChild(buttonDiv);
        // display info panel to show name and 'items'
        this.bodyDiv.appendChild(infoElement);
        // copy to clipboard button
        this.bodyDiv.appendChild(this._clipboardElement(this.list.getItems()));
        const items = this.list.getItems();
        if(Object.keys(items).length < 1){
            this.bodyDiv.appendChild(this._infoElement("No items in list"));
        }else{
            for(const item in items){
                const quantity = items[item];
                this.bodyDiv.appendChild(this._listItemElement(item, quantity, infoElement));
            }
        }
        // delete list button if items > 0
        if(Object.keys(items).length > 0){
            this.bodyDiv.appendChild(this._clearListElement());
        }
    }
    displaySavedLists(){
        // clear and refresh the headerDiv to just show a home button
        this.clearHeaderDiv();
        this.headerDiv.appendChild(this._pathElement("Home"));

        // display all saved lists
        this.clearBodyDiv();
        // display back button to return to displayList()
        this.bodyDiv.appendChild(this._customBackElement(this.displayList.bind(this,null)));
        const savedLists = this.list.getSavedListNames();
        savedLists.forEach(name => {
            this.bodyDiv.appendChild(this._savedListNameElement(name));
        });
    }
    // --------------------------------------------------
    // ELEMENTS
    // --------------------------------------------------
    _clearListElement(){
        const clearElement = this.document.createElement("button");
        clearElement.type = "button";
        clearElement.innerText = "Clear List";
        clearElement.classList.add("element");
        clearElement.classList.add("backElement");
        clearElement.addEventListener("click", this._clearListLogic.bind(this));
        return clearElement;
    }
    _clearListLogic(){
        const confirmClear = window.confirm("Are you sure you want to clear the current list?");
        if (confirmClear) {
            this.list.clearList();
            this.displayList();
        }
    }
    _clipboardElement(list){
        const clipboardElement = this.document.createElement("button");
        clipboardElement.type = "button";
        clipboardElement.innerText = "Copy to Clipboard";
        clipboardElement.classList.add("element");
        clipboardElement.classList.add("backElement");
        clipboardElement.addEventListener("click", this._clipboardLogic.bind(this,list,clipboardElement));
        return clipboardElement;
    }
    _clipboardLogic(list,element){
        let output = "";
        for (const item in list) {
            const quantity = list[item];
            output += `(${quantity}) ${item}\n`;
        }
        navigator.clipboard.writeText(output).then(() => {
            element.innerText = "Copied!";
            console.log("Copied to clipboard");
        }, (err) => {
            element.innerText = "Error Copying";
            console.error("Failed to copy: ", err);
        });
    }
    _infoElement(text){
        const infoElement = this.document.createElement("button");
        infoElement.type = "button";
        infoElement.innerText = text;
        infoElement.classList.add("element");
        infoElement.classList.add("infoElement");
        return infoElement;
    }
    _customBackElement(func,args = []){
        const customBackElement = this.document.createElement("button");
        customBackElement.type = "button";
        customBackElement.innerText = "Back";
        customBackElement.classList.add("element");
        customBackElement.classList.add("backElement");
        customBackElement.addEventListener("click", () => func(...args));
        return customBackElement;
    }
    _itemBackElement(){
        // the 'back' button shown on the item detail view. same styling, just refreshes displayBody
        const backElement = this.document.createElement("button");
        backElement.type = "button";
        backElement.innerText = "Back";
        backElement.classList.add("element");
        backElement.classList.add("backElement");
        backElement.addEventListener("click", this._itemBackLogic.bind(this));
        return backElement;
    }
    _itemBackLogic(){
        this.displayBody("refresh");
    }
    _plusElement(quantityElement,amount){
        const plusElement = this.document.createElement("button");
        plusElement.type = "button";
        plusElement.innerText = `+${amount}`;
        plusElement.classList.add("element");
        plusElement.classList.add("plusElement");
        plusElement.addEventListener("click", this._plusLogic.bind(this,quantityElement,amount));
        return plusElement;
    }
    _plusLogic(quantityElement, amount){
        quantityElement.dataset.quantity = String(Number(quantityElement.dataset.quantity) + amount);
        quantityElement.innerText = `${this.quantityPrepend} ${quantityElement.dataset.quantity}`;
    }
    _minusElement(quantityElement,amount){
        const minusElement = this.document.createElement("button");
        minusElement.type = "button";
        minusElement.innerText = `-${amount}`;
        minusElement.classList.add("element");
        minusElement.classList.add("minusElement");
        minusElement.addEventListener("click", this._minusLogic.bind(this, quantityElement, amount));
        return minusElement;
    }
    _minusLogic(quantityElement, amount){
        quantityElement.dataset.quantity = String(Number(quantityElement.dataset.quantity) - amount);
        quantityElement.innerText = `${this.quantityPrepend} ${quantityElement.dataset.quantity}`;
    }
    _quantityElement(){
        const quantityElement = this.document.createElement("button");
        quantityElement.type = "button";
        quantityElement.innerText = `${this.quantityPrepend} 1`;
        // store value of quantity to the element instead of in name
        quantityElement.dataset.quantity = "1";
        quantityElement.classList.add("element");
        quantityElement.classList.add("quantityElement");
        return quantityElement;
    }
    _acceptElement(item){
        const acceptElement = this.document.createElement("button");
        acceptElement.type = "button";
        acceptElement.innerText = "Add";
        acceptElement.classList.add("element");
        acceptElement.classList.add("acceptElement");
        acceptElement.addEventListener("click", this._acceptLogic.bind(this,item));
        return acceptElement;
    }
    _acceptLogic(item){
        // get the quantity from quantityElement text
        const quantityElement = this.bodyDiv.querySelector(".quantityElement");
        if(!quantityElement){
            console.error(`_acceptLogic(${item}) - quantityElement not found`);
            return;
        }
        let quantity = Number(quantityElement.dataset.quantity);
        if(!Number.isFinite(quantity)){quantity = 1;};
        // apply the quantity to the list
        this.list.addItem(item, quantity);
        // return view to the first path item in the path
        const path = this.dataManager.getPath();
        this.dataManager.getRoot();
        this.displayBody(path[0]);
    }
    _listElement(){
        const listElement = this.document.createElement("button");
        listElement.type = "button";
        listElement.innerText = "Lists";
        listElement.classList.add("element");
        listElement.classList.add("backElement");
        listElement.addEventListener("click", this._listLogic.bind(this));
        return listElement;
    }
    _listLogic(){
        this.displayList();
    }
    _backElement(){
        // generate and return a back button element
        const backButton = this.document.createElement("button");
        backButton.type="button";
        backButton.innerText = "Back";
        backButton.classList.add("element");
        backButton.classList.add("backElement");
        backButton.addEventListener("click", this._backLogic.bind(this));
        return backButton;
    }
    _backLogic(){
        this.clearBodyDiv();
        let categories = [];
        let items = [];
        // ADDED THIS TO GUARD AGAINST BACK CALLS FROM ROOT
        if(this.dataManager.getPath().length === 0){
            this.displayBody();
            return;
        }
        // END
        [categories, items] = this.dataManager.back();
        this.displayPath();
        // determine if we add a back button
        if(this.dataManager.getPath().length > 0){
            this.bodyDiv.appendChild(this._backElement());
        }else{
            // if no back button, show the list button because we're at the root
            this.bodyDiv.appendChild(this._listElement());
        }
        // show previous categories and items
        categories.forEach(category => {
            const categoryElement = this._categoryElement(category);
            this.bodyDiv.appendChild(categoryElement);
        });
        items.forEach(item => {
            const lastSize = this.dataManager.getSize();
            // if item starts with lastSize (remove the double quotes before compare) then we don't add lastSize
            let displayName = item;
            
            if(lastSize){
                let compareSize = lastSize.replace(/"/g, "");
                if(!displayName.startsWith(compareSize)){
                    displayName = `${lastSize} ${item}`;
                }
            }
            const itemElement = this._itemElement(displayName);
            this.bodyDiv.appendChild(itemElement);
        });
    }
    _categoryElement(name){
        const categoryButton = this.document.createElement("button");
        categoryButton.type="button";
        categoryButton.innerText = name;
        categoryButton.classList.add("element");
        categoryButton.classList.add("categoryElement");
        categoryButton.addEventListener("click", this._categoryLogic.bind(this, name));
        return categoryButton;
    }
    _categoryLogic(name){
        this.displayBody(name);
    }
    _itemElement(name){
        const itemButton = this.document.createElement("button");
        itemButton.type="button";
        itemButton.innerText = name;
        itemButton.classList.add("element");
        itemButton.classList.add("itemElement");
        itemButton.addEventListener("click", this._itemLogic.bind(this, name));
        return itemButton;
    }
    _itemLogic(name){
        // display the item details / quantity adjuster
        this.displayItem(name);
    }
    _pathElement(name){
        const pathButton = this.document.createElement("button");
        pathButton.type="button";
        pathButton.innerText = name;
        pathButton.classList.add("element");
        pathButton.classList.add("pathElement");
        pathButton.addEventListener("click", this._pathLogic.bind(this, name));
        return pathButton;
    }
    _pathLogic(name){
        if(name === "Home"){
            this.displayBody();
            return;
        }
        // we get the full path array from dataManager
        const fullPath = this.dataManager.getPath();
        // clear it by calling root
        this.dataManager.getRoot();
        // we then select entries in the path until we set it to this 'name'
        for(let i = 0; i < fullPath.length; i++){
            // if we're already at the match, pass off to displayBody()
            if(fullPath[i] === name){
                this.displayBody(name);
                return;
            }else{ // otherwise update dataManager
                this.dataManager.select(fullPath[i]);
            }
        }
    }
    _loadSavedListsElement(){
        const loadListElement = this.document.createElement("button");
        loadListElement.type = "button";
        loadListElement.classList.add("listLoadingElement");
        loadListElement.innerText = "Load List";
        loadListElement.addEventListener("click", this._loadSavedListsLogic.bind(this));
        return loadListElement;
    }
    _loadSavedListsLogic(){
        this.displaySavedLists();
    }
    _saveListElement(listNameElement){
        const saveListElement = this.document.createElement("button");
        saveListElement.type = "button";
        saveListElement.classList.add("listLoadingElement");
        saveListElement.innerText = "Save List";
        saveListElement.addEventListener("click", this._saveCurrentList.bind(this,listNameElement));
        return saveListElement;
    }
    _saveCurrentList(listNameElement){
        const name = window.prompt("Save list as: ", "List 1");
        if(name && name.trim()){
            this.list.save(name.trim());
            listNameElement.innerText = `\"${this.list.getLoadedListName()}\" - Items:`;
        }

    }
    _listItemElement(name,quantity,listNameElement){
        // DIV
        const div = this.document.createElement("div");
        div.classList.add("listItemDiv");
        // INFO
        const info = this.document.createElement("button");
        info.type = "button";
        info.dataset.quantity = quantity;
        info.dataset.name = name;
        info.innerText = `(${quantity}) ${name}`;
        info.classList.add("listItemElement");
        info.addEventListener("click", this._listItemElementEvent.bind(this, info));
        // MINUS
        const minus = this.document.createElement("button");
        minus.type = "button";
        minus.innerText = "-";
        minus.addEventListener("click", this._listItemElementMinusEvent.bind(this, info, div,listNameElement));
        minus.classList.add("listItemQuantityElement");
        minus.classList.add("listItemMinusElement");
        div.appendChild(minus);
        div.appendChild(info); // < -- // fixed this line from div.appendChild(info,div);
        // PLUS
        const plus = this.document.createElement("button");
        plus.type = "button";
        plus.innerText = "+";
        plus.classList.add("listItemQuantityElement");
        plus.classList.add("listItemPlusElement");
        plus.addEventListener("click", this._listItemElementPlusEvent.bind(this, info,listNameElement));
        div.appendChild(plus);
        return div;
    }
    _listItemElementMinusEvent(infoElement,div,listNameElement){
        const quantity = parseInt(infoElement.dataset.quantity);
        if(quantity > 1){
            infoElement.dataset.quantity = quantity - 1;
            infoElement.innerText = `(${infoElement.dataset.quantity}) ${infoElement.dataset.name}`;
            this.list.addItem(infoElement.dataset.name, -1);
        }else{
            this.list.deleteItem(infoElement.dataset.name);
            div.remove();
        }
        listNameElement.innerText = `\"${this.list.getLoadedListName()}\" - Items:`;
    }
    _listItemElementPlusEvent(infoElement,listNameElement){
        const quantity = parseInt(infoElement.dataset.quantity);
        infoElement.dataset.quantity = quantity + 1;
        infoElement.innerText = `(${infoElement.dataset.quantity}) ${infoElement.dataset.name}`;
        this.list.addItem(infoElement.dataset.name, 1);
        listNameElement.innerText = `\"${this.list.getLoadedListName()}\" - Items:`;
    }
    _listItemElementEvent(infoElement){
        // we just toggle classes. listItemElement / listItemElementClicked
        infoElement.classList.toggle("listItemElementClicked");
    }
    _savedListNameElement(name){
        // create an element that shows the name of a list with a delete button to the right
        const div = this.document.createElement("div");
        div.classList.add("listManagementDiv");
        // create the name button
        const nameButton = this.document.createElement("button");
        nameButton.type = "button";
        nameButton.innerText = name;
        nameButton.classList.add("savedListNameElement");
        nameButton.addEventListener("click", this._savedListNameLogic.bind(this,name));
        div.appendChild(nameButton);
        // create the delete button
        const deleteButton = this.document.createElement("button");
        deleteButton.type = "button";
        deleteButton.innerText = "X";
        deleteButton.classList.add("savedListDeleteElement");
        deleteButton.addEventListener("click", this._savedListDeleteLogic.bind(this,name,div));
        div.appendChild(deleteButton);
        return div;
    }
    _savedListNameLogic(name){
        this.displayList(name);
    }
    _savedListDeleteLogic(name,div){
        this.list.deleteList(name);
        div.remove();
    }
}