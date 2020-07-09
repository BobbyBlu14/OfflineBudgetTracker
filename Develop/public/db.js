const { all } = require("../routes/api");

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

  const request = window.indexedDB.open("budget", 1);
  let db;


  request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
  };

  request.onsuccess = ({ target }) => {
      db = target.result;


  if (navigator.onLine){
      checkDatabase();
  }
};

request.onerror = function(event) {
    console.log("There was an error"+ event.target.onerrorCode);
  };

function saveTrans(record) {
const transaction = db.transaction("pending", "readwrite");
const store = transaction.objectStore("pending");
store.add(record);
}

function checkDatabase(){
const transaction = db.transaction("pending", "readwrite");
const store = transaction.objectStore("pending");
const all = store.getAll();


all.onsuccess = function(){
    if (all.result.length > 0) {
    fetch("/api/transaction/bulk", {
    method: "POST",
    body: JSON.stringify(all.result),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  }).then(response => {        
    return response.json();
  })
  .then(() => {
    // delete records if successful
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.clear();
  });
}
};
}
// listen for app coming back online
window.addEventListener("online", checkDatabase)