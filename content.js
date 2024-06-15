// content.js

function toggleReaderMode() {
    const mainContent = document.querySelector('article') || document.querySelector('main') || document.body;
    const elementsToHide = document.querySelectorAll('header, footer, nav, aside, .sidebar, .advertisement, [class*="ad-"], [id*="ad-"]');

    if (document.body.classList.contains('reader-mode')) {
        document.body.classList.remove('reader-mode');
        elementsToHide.forEach(el => el.style.display = '');
    } else {
        document.body.classList.add('reader-mode');
        elementsToHide.forEach(el => el.style.display = 'none');
        mainContent.style.margin = '0 auto';
        mainContent.style.width = '60%';
    }
}

function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function highlightVocabulary(words) {
    const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');

    function highlightTextNode(node) {
        const text = node.nodeValue;
        const span = document.createElement('span');
        span.innerHTML = text.replace(regex, '<span class="highlighted">$&</span>');
        node.parentNode.replaceChild(span, node);
    }

    function traverseNodes(node) {
        if (node.nodeType === Node.TEXT_NODE && isVisible(node.parentNode)) {
            highlightTextNode(node);
        } else {
            node.childNodes.forEach(childNode => traverseNodes(childNode));
        }
    }

    traverseNodes(document.body);
}

const vocabularyData = {
    abandon: {
        definition: 'cease to support or look after (someone); desert.',
        example: 'Her natural mother had abandoned her at an early age.',
        audio: 'path/to/abandon.mp3'
    },
    benefit: {
        definition: 'an advantage or profit gained from something.',
        example: 'Enjoy the benefits of being a member.',
        audio: 'path/to/benefit.mp3'
    }
    // Add more vocabulary data as needed
};

function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'vocab-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.right = '0';
    sidebar.style.top = '0';
    sidebar.style.width = '300px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = '#f4f4f4';
    sidebar.style.borderLeft = '1px solid #ccc';
    sidebar.style.padding = '10px';
    sidebar.style.overflowY = 'scroll';
    document.body.append(sidebar);
}

// content.js

async function fetchDefinition(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (response.ok) {
        const data = await response.json();
        const definition = data[0].meanings[0].definitions[0].definition;
        const audio = data[0].phonetics.find(p => p.audio)?.audio;
        const examples = data[0].meanings[0].definitions[0].example ? [data[0].meanings[0].definitions[0].example] : [];

        return { definition, audio, examples };
    } else {
        console.error(`Error fetching definition for ${word}: ${response.statusText}`);
        return null;
    }
}

async function showVocabularyDetails(word) {
    const sidebar = document.getElementById('vocab-sidebar');
    const result = await fetchDefinition(word);

    if (result) {
        sidebar.innerHTML = `
          <h2>${word}</h2>
          <p><strong>Definition:</strong> ${result.definition}</p>
          ${result.examples.length > 0 ? `<p><strong>Examples:</strong> <ul>${result.examples.map(example => `<li>${example}</li>`).join('')}</ul></p>` : ''}
          ${result.audio ? `<audio controls><source src="${result.audio}" type="audio/mpeg">Your browser does not support the audio element.</audio>` : '<p><strong>Audio:</strong> Not available</p>'}
        `;
    } else {
        sidebar.innerHTML = `
          <h2>${word}</h2>
          <p><strong>Definition:</strong> Not found</p>
          <p><strong>Examples:</strong> Not available</p>
          <p><strong>Audio:</strong> Not available</p>
        `;
    }
}



document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('highlighted')) {
        const word = e.target.textContent;
        showVocabularyDetails(word);
    }
});

createSidebar();

function loadVocabulary(callback) {
    fetch(chrome.runtime.getURL('ielts-core.json'))
        .then(response => response.json())
        .then(data => {
            callback(data.IELTS_core_vocabulary);
        })
        .catch(error => console.error('Error loading vocabulary:', error));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("content.js request: " + request.action)
    if (request.action === 'toggleReaderMode') {
        toggleReaderMode();
        sendResponse({ status: 'Reader Mode toggled' });
    } else if (request.action === 'highlightVocabulary') {
        loadVocabulary(words => {
            highlightVocabulary(words);
            sendResponse({ status: 'Vocabulary Highlighted' });
        });
    } else if (request.action === 'speakSelectedText') {
        const selectedText = window.getSelection().toString();
        console.log(selectedText)
        if (selectedText) {
            speakText(selectedText);
        } else {
            alert('Please select some text to read.');
        }
    } else if (request.action === 'hotReload') {
        window.location.reload();
    }
});

// Add CSS for highlighted words
const style = document.createElement('style');
style.textContent = `.highlighted { background-color: yellow; }`;
document.head.append(style);

function recordHistory() {
    const title = document.title;
    chrome.storage.local.get(['history'], (result) => {
        let history = result.history || [];
        history.push(title);
        chrome.storage.local.set({ history });
    });
}

recordHistory();


let synthesizer;
// let SpeechSDK;

function initializeSpeechSDK() {
    if (typeof SpeechSDK === 'undefined') {
        console.error('SpeechSDK is not defined');
        return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("f6e22df4e31f4700a7d99201d9a01796", "eastasia");
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
    synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    console.log("Speech SDK Initialized");
}

console.log("content.js ===")
// Function to add speech buttons to each paragraph
function addSpeechButtons() {
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach((paragraph, index) => {
        const button = document.createElement('button');
        button.innerText = '🔊';
        button.className = 'speech-button';
        button.dataset.paragraphIndex = index;
        paragraph.appendChild(button);
    });
    console.log("Speech buttons added to paragraphs");
}

// Function to handle speech synthesis
function speakText(text) {
    if (!synthesizer) {
        console.error('Speech SDK not initialized');
        return;
    }

    synthesizer.speakTextAsync(
        text,
        result => {
            if (SpeechSDK && result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                console.log("Synthesis finished.");
            } else {
                console.error("Speech synthesis canceled: " + result.errorDetails);
            }
        },
        error => {
            console.error(error);
        }
    );
}


// Event listener for button clicks
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('speech-button')) {
        const paragraphIndex = event.target.dataset.paragraphIndex;
        const paragraph = document.querySelectorAll('p')[paragraphIndex];
        const paragraphText = paragraph.innerText;
        speakText(paragraphText);
    }
});

// window.addEventListener('load', () => {
// loadSpeechSDK(() => {
initializeSpeechSDK();
addSpeechButtons();
console.log("hello: ", hello)
// });
//   });