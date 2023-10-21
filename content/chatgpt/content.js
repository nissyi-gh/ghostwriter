const ghostWriterIconImage = document.createElement('img');
ghostWriterIconImage.src = chrome.runtime.getURL('images/ghost_writer_128.png');

const ghostWriterButton = document.createElement('button');
ghostWriterButton.className = 'ghost-writer-button';

ghostWriterButton.appendChild(ghostWriterIconImage);

const addGhostWriter = () => {
  const buttonElement = document.querySelector('[data-testid="send-button"]');
  buttonElement.parentNode.insertBefore(ghostWriterButton, buttonElement);
};

addGhostWriter();

// TODO: 767px以下のタブレットサイズになると表示されないので対応する
document.querySelector('#__next nav').addEventListener('click', () => {
  setTimeout(() => {
    addGhostWriter();
  }, 500);
});
