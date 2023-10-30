let db;

function initDB() {
  const request = indexedDB.open("ghostWriterDB");

  request.onsuccess = function(event) {
    db = event.target.result;
    console.log("ghostWriterDB initialized:", event);
  };

  request.onerror = function(event) {
    console.log("Error initializing ghostWriterDB:", event);
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains('prompts')) {
      const promptsDb = db.createObjectStore("prompts", { keyPath: "id", autoIncrement: true });
      promptsDb.add({
        title: "サンプルのプロンプト1 優秀なWebエンジニア",
        prompt: "## 前提\nあなたは優秀なWebエンジニアです。以下の質問に回答してください。\n\n## 質問\n（ここに質問を書く）\n\n## 回答\n回答は必ず日本語で答えてください。"
      });
      promptsDb.add({
        title: "サンプルのプロンプト2 英会話講師",
        prompt: "## 前提\nあなたはとても優秀な英会話講師です。以下の質問に回答してください。\n\n## 質問\n（ここに質問を書く）\n\n## 回答\n基本的には英語で回答し、おかしいところは日本語で教えてください。"
      });
      console.log("ghostWriterDB's prompts object store created, and sample prompt added.");
    }
  };
}

function addPromptToDB(title, prompt) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("prompts", "readwrite");
    const objectStore = transaction.objectStore("prompts");
    const request = objectStore.add({ title, prompt });

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("Error adding prompt to DB:", event);
      reject(new Error("Error adding prompt to DB."));
    };
  });
}

function deleteDB(callback) {
  const request = indexedDB.deleteDatabase("ghostWriterDB");

  request.onsuccess = function(event) {
    console.log("Database deleted successfully.");
    callback();
  };

  request.onerror = function(event) {
    console.log("Error deleting database:", event);
  };

  request.onblocked = function(event) {
    console.log("Delete operation blocked. Close any open instances of the database and try again.");
  };
}

function fetchAllPrompts() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("prompts", "readonly");
    const objectStore = transaction.objectStore("prompts");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
      const data = event.target.result;

      if (data && data.length) {
        resolve(data);
      } else {
        console.log("No data found in database.");
        resolve([]);
      }
    };

    request.onerror = function(event) {
      console.log("Error fetching data:", event);
      reject(new Error("Error fetching data from IndexedDB."));
    };
  });
}

function deletePromptFromDB(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("prompts", "readwrite");
    const objectStore = transaction.objectStore("prompts");
    const request = objectStore.delete(id);

    request.onsuccess = function(event) {
      resolve();
    };

    request.onerror = function(event) {
      console.error("Error deleting prompt from DB:", event);
      reject(new Error("Error deleting prompt from DB."));
    };
  });
}

initDB();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action === "get") {
    fetchAllPrompts().then(data => {
      sendResponse(data);
    }).catch(error => {
      sendResponse({error: error.message});
    });
    return true;
  } else if (message.action === "add") {
    addPromptToDB(message.title, message.prompt).then(id => {
      sendResponse({id});
    }).catch(error => {
      sendResponse({error: error.message});
    });
    return true;
  } else if (message.action === "delete") {
    deletePromptFromDB(message.id).then(() => {
      sendResponse({});
    }).catch(error => {
      sendResponse({error: error.message});
    });
    return true;
  }
});
