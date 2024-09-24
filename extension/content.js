// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_CHATGPT") {
    let text;

    // Example selector for a contenteditable element in online IDEs
    const codeEditor = document.querySelector('.editor'); // Adjust this based on the specific IDE

    if (codeEditor) {
      text = codeEditor.innerText.trim();
    } else {
      // Fallback to regular selection
      text = document.getSelection().toString().trim();
    }

    if (!text) {
      alert("No text found. Please select text or type in a text area.");
      return;
    }

    showLoadingCursor();

    fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    })
      .then((response) => response.json())
      .then(data => {
        const reply = data.reply;

        // Copy the response to the clipboard
        navigator.clipboard.writeText(reply)
          .then(() => {
            alert("Response copied to clipboard!");
          })
          .catch(err => {
            console.error("Failed to copy: ", err);
            alert("Failed to copy the response to clipboard.");
          });

        restoreCursor();
      })
      .catch(error => {
        restoreCursor();
        alert("Error communicating with the server.");
        console.error(error);
      });
  }
});

const showLoadingCursor = () => {
  const style = document.createElement("style");
  style.id = "cursor_wait";
  style.innerHTML = `* {cursor: wait;}`;
  document.head.appendChild(style);
};

const restoreCursor = () => {
  const loadingCursor = document.getElementById("cursor_wait");
  if (loadingCursor) {
    loadingCursor.remove();
  }
};
