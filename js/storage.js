export class Storage{
    constructor(){
    }
    writeStorage(key, value){
        localStorage.setItem(key, value);
    }
    writeStorageObject(key,object){
        localStorage.setItem(key, JSON.stringify(object));
    }
    readStorage(key){
        try{
            const data = JSON.parse(localStorage.getItem(key));
            return data || null;
        }catch(err){
            console.log(`Error reading data: ${err}`);
            return null;
        }
    }
}