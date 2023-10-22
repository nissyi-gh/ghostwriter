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
        title: "サンプルのプロンプト 優秀なWebエンジニア",
        prompt: "## 前提\nあなたは優秀なWebエンジニアです。以下の質問に回答してください。\n\n## 質問\n（ここに質問を書く）\n\n## 回答\n回答は必ず日本語で答えてください。"
      });
      console.log("ghostWriterDB's prompts object store created, and sample prompt added.");
    }
  };
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

// 初期化の実験を開始
deleteDB(initDB);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action === "get") {
    sendResponse('contents');
    return true;
  }
});
