const ghostWriterIconImage = document.createElement('img');
ghostWriterIconImage.src = chrome.runtime.getURL('images/ghost_writer_128.png');

const ghostWriterButton = document.createElement('button');
ghostWriterButton.className = 'ghost-writer-button';

ghostWriterButton.appendChild(ghostWriterIconImage);

const applyPrompt = (prompt) => {
  const lines = prompt.split("\n");
  const textareaHeight = lines.length * 50;

  const textarea = document.getElementById("prompt-textarea");
  textarea.value = prompt;
  textarea.style.height = `${textareaHeight}px`;
}

// プロンプトリストを描画する
fetch(chrome.runtime.getURL('content/chatgpt/prompt_list.html'))
    .then(response => response.text())
    .then(data => {
      const promptList = document.createElement('div');
      promptList.innerHTML = data;
      promptList.className = 'ghost-writer-prompt-list';

      const promptTextArea = document.querySelector('#prompt-textarea')
      promptTextArea.parentNode.insertBefore(promptList, promptTextArea);

      document.querySelectorAll('#ghost-writer-prompts > li').forEach((li) => {
        li.addEventListener('click', () => {
          if (document.getElementById("selected")) {
            document.getElementById("selected").removeAttribute("id");
          }
          li.setAttribute("id", "selected");
        });
      })

      // プロンプト適用ボタン
      document.getElementById("gw-prompt-override").addEventListener('click', () => {
        const prompt = document.getElementById("selected").innerText;
        applyPrompt(prompt);
      })
    })
    .catch(error => console.error(error));

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
