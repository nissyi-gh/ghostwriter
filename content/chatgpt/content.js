const ghostWriterIconImage = document.createElement('img');
ghostWriterIconImage.src = chrome.runtime.getURL('images/ghost_writer_128.png');

const ghostWriterButton = document.createElement('button');
ghostWriterButton.className = 'ghost-writer-button';
ghostWriterButton.addEventListener('click', () => {
  const promptList = document.getElementById("gw-list-wrapper")
  if (promptList.style.display === 'none') {
    promptList.style.display = 'block';
  } else {
    promptList.style.display = 'none';
  }
})

ghostWriterButton.appendChild(ghostWriterIconImage);

const applyPrompt = (prompt) => {
  const lines = prompt.split("\n");
  const textareaHeight = lines.length * 50;

  const textarea = document.getElementById("prompt-textarea");
  textarea.value = prompt;
  textarea.style.height = `${textareaHeight}px`;
}

function getTextFromDB() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "get" }, (data) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(data);
      }
    });
  });
}

function addPromptDB(title, prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "add", title: title, prompt: prompt }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(response);
      }
    });
  });
}

const addLiPromptItem = (parentNode, id, title, prompt) => {
  const li = document.createElement('li');
  const titleHeader = document.createElement('div');
  const deleteButton = document.createElement('div');
  const titleElement = document.createElement('p');
  const promptElement = document.createElement('p');

  titleElement.innerText = title;
  deleteButton.innerText = '削除';
  deleteButton.className = 'gw-prompt-delete';
  titleHeader.className = 'gw-prompt-title';
  titleHeader.appendChild(titleElement);
  titleHeader.appendChild(deleteButton);
  promptElement.innerText = prompt;
  promptElement.className = 'gw-prompt';
  li.appendChild(titleHeader);
  li.appendChild(promptElement);
  li.dataset.id = id;
  parentNode.appendChild(li);
}

const addPromptList = () => {
  // プロンプトリストを描画する
  fetch(chrome.runtime.getURL('content/chatgpt/prompt_list.html'))
    .then(response => response.text())
    .then(data => {
      const promptList = document.createElement('div');
      promptList.innerHTML = data;
      promptList.className = 'ghost-writer-prompt-list';

      const gwButton = document.querySelector('.ghost-writer-button')
      gwButton.parentNode.insertBefore(promptList, gwButton);

      getTextFromDB().then(data => {
        const promptList = document.getElementById("ghost-writer-prompts");
        data.forEach((prompt) => {
          addLiPromptItem(promptList, prompt.id, prompt.title, prompt.prompt);
          document.querySelectorAll('#ghost-writer-prompts > li').forEach((li) => {
            li.addEventListener('click', () => {
              if (document.getElementById("selected")) {
                document.getElementById("selected").removeAttribute("id");
              }
              li.setAttribute("id", "selected");
            });
          })
        })
      }).catch(error => console.error(error));

      // プロンプト適用ボタン
      document.getElementById("gw-prompt-override").addEventListener('click', () => {
        const prompt = document.getElementById("selected").querySelector('.gw-prompt').innerText;
        applyPrompt(prompt);
      })

      // プロンプト追加フォーム
      document.getElementById("gw-prompt-add").addEventListener('click', () => {
        const promptList = document.getElementById("gw-list-wrapper");
        const promptForm = document.getElementById("gw-form-wrapper");
        promptList.style.display = 'none';
        promptForm.style.display = 'block';
      })

      // 一覧へ戻る
      document.getElementById("gw-back-list").addEventListener('click', () => {
        const promptList = document.getElementById("gw-list-wrapper");
        const promptForm = document.getElementById("gw-form-wrapper");
        promptList.style.display = 'block';
        promptForm.style.display = 'none';
      })

      // プロンプト追加フォームの送信
      document.getElementById("gw-prompt-add-form").addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.querySelector('input[name="title"]').value;
        const prompt = document.querySelector('textarea[name="prompt"]').value;

        if (prompt.match(/^\s*$/)) {
          alert('プロンプトを入力してください');
          return;
        }

        addPromptDB(title, prompt).then(() => {
          const promptList = document.getElementById("ghost-writer-prompts");
          addLiPromptItem(promptList, title, prompt);
          document.querySelectorAll('#ghost-writer-prompts > li').forEach((li) => {
            li.addEventListener('click', () => {
              if (document.getElementById("selected")) {
                document.getElementById("selected").removeAttribute("id");
              }
              li.setAttribute("id", "selected");
            });
          })
          document.querySelector('input[name="title"]').value = '';
          document.querySelector('textarea[name="prompt"]').value = '';
          document.getElementById("gw-list-wrapper").style.display = 'block';
          document.getElementById("gw-form-wrapper").style.display = 'none';
        }).catch(error => console.error(error));
      })
    })
    .catch(error => console.error(error));
}

const addGhostWriter = () => {
  const targetElement = document.querySelector('form > div > div.flex.w-full.items-center div');
  targetElement.parentNode.insertBefore(ghostWriterButton, targetElement);
  addPromptList();
};

addGhostWriter();

// TODO: 767px以下のタブレットサイズになると表示されないので対応する
document.querySelector('#__next nav').addEventListener('click', () => {
  setTimeout(() => {
    addGhostWriter();
  }, 500);
});
