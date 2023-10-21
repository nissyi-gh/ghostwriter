const ghostWriterIconImage = document.createElement('img');
ghostWriterIconImage.src = chrome.runtime.getURL('images/ghost_writer_128.png');

const ghostWriterButton = document.createElement('button');
ghostWriterButton.className = 'ghost-writer-button';

ghostWriterButton.appendChild(ghostWriterIconImage);
// プロンプト送信ボタンの前にアイコンを挿入
const buttonElement = document.querySelector('[data-testid="send-button"]');
buttonElement.parentNode.insertBefore(ghostWriterButton, buttonElement);
