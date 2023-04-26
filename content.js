function addButtonsToExistingCodeElements() {
  const codeElements = document.querySelectorAll('code');
  codeElements.forEach(codeElement => {
    const newElement = createNewElement(codeElement);
    codeElement.parentNode.insertBefore(newElement, codeElement.nextSibling);
  });
}

function addButtonsToNewCodeElements(addedNodes) {
  addedNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'code') {
      console.log('each node cl: ', JSON.stringify(node.classList, undefined, 2));
      const newElement = createNewElement(node);
      node.parentNode.insertBefore(newElement, node.nextSibling);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const codeElements = node.querySelectorAll('code');
      codeElements.forEach(codeElement => {
        const newElement = createNewElement(codeElement);
        codeElement.parentNode.insertBefore(newElement, codeElement.nextSibling);
      });
    }
  });
}


function toggleButtons(isVisible) {
  const buttons = document.querySelectorAll('.code-element-parser-button');
  buttons.forEach(button => {
    if (!isVisible) {
      button.remove();
    }
  });
}


var observer;
var isObserverEnabled = true;


function init() {
  addButtonsToExistingCodeElements();

  if (!observer) {
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          addButtonsToNewCodeElements(mutation.addedNodes);
        }
      });
    });

    const observerConfig = {
      childList: true,
      subtree: true
    };

    observer.observe(document.body, observerConfig);
  }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.toggleObserver) {
    isObserverEnabled = !isObserverEnabled;

    if (isObserverEnabled) {
      init();
    } else {
      observer.disconnect();
      observer = null;
    }

    // Muestra u oculta los botones según el estado de isObserverEnabled
    toggleButtons(isObserverEnabled);

    // Actualiza el icono según el estado de isObserverEnabled
    chrome.runtime.sendMessage({ updateIcon: true, isEnabled: isObserverEnabled });
  }
});





function closeModal(modalBackground) {
  document.body.removeChild(modalBackground);
}

function executeUserFunction(codeElement, userFunction) {
  try {
    const func = new Function('codeElement', userFunction);
    func(codeElement);
  } catch (error) {
    console.error('Error al ejecutar la función del usuario:', error);
  }
}

function createModal(codeElement) {
  // console.log('codeElement: '+ JSON.stringify(...codeElement, undefined, 2));
  const modalBackground = document.createElement('div');
  modalBackground.className = 'modal-background';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h3>Escribe la función onclick</h3>
    <textarea id="userFunction" placeholder="Escribe tu función aquí..."></textarea>
    <button id="executeFunction">Ejecutar</button>
    <button id="closeModal">Cerrar</button>
  `;

  modalBackground.appendChild(modal);
  document.body.appendChild(modalBackground);

  document.getElementById('executeFunction').onclick = () => {
    const userFunction = document.getElementById('userFunction').value;
    executeUserFunction(codeElement, userFunction);
    closeModal(modalBackground);
  };

  document.getElementById('closeModal').onclick = () => {
    closeModal(modalBackground);
  };
}

function createNewElement(codeElement) {
  let newElement = codeElement.nextSibling;
  if (newElement) {
      newElement.textContent = 'Click';
  } else {
    newElement = document.createElement('button');
    newElement.className = 'code-element-parser-button';
    newElement.textContent = 'Click';
    codeElement.parentNode.insertBefore(newElement, codeElement.nextSibling);
  }

  newElement.onclick = () => {
    createModal(codeElement);
  };
  return newElement;
}

function injectStyles() {
  const styles = `
    .modal-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .modal {
      background-color: rgba(255, 255, 255, 0.5);
      padding: 20px;
      color: #000000;
      border-radius: 5px;
      width: 80%;
      max-width: 400px;
    }

    .modal button {
      padding: 5px;
      border-radious: 5px:
    }

    .modal textarea {
      width: 100%;
      min-height: 100px;
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

injectStyles();


function processSelectedCodeElement() {
  const codeElements = document.getElementsByTagName('code');
  for (let i = 0; i < codeElements.length; i++) {
    const codeElement = codeElements[i];
    codeElement.onclick = () => {
      const newElement = createNewElement(codeElement);
      codeElement.parentNode.insertBefore(newElement, codeElement.nextSibling);
    };
  }
}



// processSelectedCodeElement();
init();
