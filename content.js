// content.js

function toggleReaderMode() {
    const mainContent = detectMainContent();
    if (mainContent) {
        createReaderOverlay(mainContent);
        // addSpeechButtons();
        document.getElementById('main-article').addEventListener('click', async (event) => {
            // Check if the click is on a word
            const selection = window.getSelection();
            const selectedWord = selection.toString().trim();

            if (!selectedWord.includes(' ')) { // not a sentence
                // Show the vocabulary details for the selected word
                await showVocabularyDetails(selectedWord.toLowerCase());
            }
        });

        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('highlighted')) {
                const word = e.target.textContent;
                showVocabularyDetails(word);
            }
        });
    } else {
        console.error('Main content not found');
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
function createReaderOverlay(mainContent) {
    // Create overlay elements
    const overlay = document.createElement('div');
    overlay.id = 'reader-overlay';

    const mainArticle = document.createElement('div');
    mainArticle.id = 'main-article';

    // Add class to original paragraphs and add speaker icons
    mainContent.querySelectorAll('p').forEach(paragraph => {
        paragraph.classList.add('original-paragraph');
        const clonedParagraph = paragraph.cloneNode(true);

        // Add speaker icon to each original paragraph
        const speakerIcon = document.createElement('span');
        speakerIcon.className = 'speaker-icon';
        speakerIcon.textContent = '🔊';
        speakerIcon.addEventListener('click', () => {
            speakText(clonedParagraph.textContent);
        });

        clonedParagraph.appendChild(speakerIcon);
        mainArticle.appendChild(clonedParagraph);
    });

    const sidebar = document.createElement('div');
    sidebar.id = 'vocab-sidebar';

    const controlsSection = document.createElement('div');
    controlsSection.id = 'controls-section';

    const detailsSection = document.createElement('div');
    detailsSection.id = 'details-section';

    const closeButton = document.createElement('div');
    closeButton.id = 'reader-overlay-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Create switch for bilingual mode
    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';

    const bilingualSwitch = document.createElement('input');
    bilingualSwitch.type = 'checkbox';
    bilingualSwitch.id = 'bilingual-switch';
    bilingualSwitch.addEventListener('change', () => {
        toggleBilingualMode(mainArticle);
    });

    const slider = document.createElement('span');
    slider.className = 'slider round';

    switchLabel.appendChild(bilingualSwitch);
    switchLabel.appendChild(slider);

    // Create loading status element
    const loadingStatus = document.createElement('div');
    loadingStatus.id = 'loading-status';
    loadingStatus.textContent = 'Loading translations...';

    // Append elements to the controls section
    controlsSection.appendChild(switchLabel);
    controlsSection.appendChild(document.createTextNode('Bilingual Mode'));
    controlsSection.appendChild(loadingStatus);

    const dictLoadingStatus = document.createElement('div');
    dictLoadingStatus.id = 'dict-loading-status';
    dictLoadingStatus.textContent = 'Loading Dictionary...';
    dictLoadingStatus.style.display = 'none';

    // Append sections to the sidebar
    sidebar.appendChild(controlsSection);
    sidebar.appendChild(dictLoadingStatus);
    sidebar.appendChild(detailsSection);

    // Append elements to the overlay
    overlay.appendChild(mainArticle);
    overlay.appendChild(sidebar);
    overlay.appendChild(closeButton);

    // Append overlay to the body
    document.body.appendChild(overlay);

    loadCSS('reader.css');
}

// Function to load an external CSS file
function loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(url);
    document.head.appendChild(link);
}


function detectMainContent() {
    // Check for common semantic tags
    const commonTags = ['article', 'main', 'section'];
    for (const tag of commonTags) {
        console.log("detech tag ", tag)
        const elements = document.getElementsByTagName(tag);
        console.log("length: ", elements.length)
        if (elements.length > 0) {
            return elements[0]; // Return the first matching element
        }
    }

    // Check for common class names
    const commonClasses = ['content', 'main', 'article', 'post'];
    for (const className of commonClasses) {
        const elements = document.getElementsByClassName(className);
        if (elements.length > 0) {
            return elements[0]; // Return the first matching element
        }
    }

    // Check for common ID names
    const commonIDs = ['content', 'main', 'article', 'post'];
    for (const id of commonIDs) {
        const element = document.getElementById(id);
        if (element) {
            return element; // Return the matching element
        }
    }

    // Check for the largest text block
    const allElements = document.body.getElementsByTagName('*');
    let largestElement = null;
    let maxTextLength = 0;
    for (const element of allElements) {
        if (element.offsetWidth > 0 && element.offsetHeight > 0) { // Only consider visible elements
            const textLength = element.textContent.length;
            if (textLength > maxTextLength) {
                maxTextLength = textLength;
                largestElement = element;
            }
        }
    }

    return largestElement; // Return the largest text block element
}

async function fetchDefinition(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.error(`Error fetching definition for ${word}: ${response.statusText}`);
        return null;
    }
}

async function showVocabularyDetails(word) {
    const detail = document.getElementById('details-section');
    const loadingStatus = document.getElementById('dict-loading-status');
    loadingStatus.style.display = 'block';
    const result = await fetchDefinition(word);
    loadingStatus.style.display = 'none';

    if (result) {
        detail.innerHTML = getVocabularyDetailsTemplate(word, result[0]);

        // Add event listeners to the speech buttons
        document.querySelectorAll('.example-speech-button').forEach(button => {
            button.addEventListener('click', () => {
                const exampleText = button.nextSibling.textContent.trim();
                speakText(exampleText);
            });
        });
        document.querySelectorAll('.phonetic-speaker-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const audioElement = icon.nextElementSibling;
                if (audioElement && audioElement.tagName === 'AUDIO') {
                    audioElement.play();
                }
            });
        });
    } else {
        detail.innerHTML = `
        <h2>${word}</h2>
        <p><strong>Definition:</strong> Not found</p>
        <p><strong>Examples:</strong> Not available</p>
        <p><strong>Audio:</strong> Not available</p>
      `;
    }
}

function getVocabularyDetailsTemplate(word, result) {
    return `
      <h2>${word}</h2>
      <div class='phonetics'>
      ${result.phonetics && result.phonetics.length > 0 ? result.phonetics.map(phonetic => {
        if (phonetic.text && phonetic.audio) {
            return `
        <p>${phonetic.text ? phonetic.text : ''}
        ${phonetic.audio ? `<span class="phonetic-speaker-icon" data-audio-url="${phonetic.audio}">🔊</span>` : ''}
        <audio class="hidden-audio" src="${phonetic.audio}"/>
        </p>
      `}
    }).join('') : ''}
      </div>
      ${result.meanings && result.meanings.length > 0 ? `
        <div>
          ${result.meanings.map(meaning => `
            <p class='partOfSpeech'>${meaning.partOfSpeech}: ${word}</p>
            <ol>
            ${meaning.definitions.map((definition, definitionIndex) => `
              <li>
                ${definition.definition}
                ${definition.synonyms && definition.synonyms.length > 0 ? `
                <p><strong>synonyms:</strong> </p>
                    ${definition.synonyms.map(synonym => `
                    <span>${synonym}</span>   
                    `)}
                ` : ''} 
                ${definition.example ? `
                  <p class='example'><button class="example-speech-button" data-example-index="${definitionIndex}">🔊</button> ${definition.example}</p>
                ` : ''}
              </li>
            `).join('')}
            </ol>
          `).join('<hr/>')}
        </div>
      ` : '<p><strong>Definitions:</strong> Not available</p>'}
      ${result.sourceUrls && result.sourceUrls.length > 0 ? `
        <br/>
        <hr/>
        <strong>Source:</strong>
        <ul>
          ${result.sourceUrls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('')}
        </ul>
      ` : ''}
    `;
}

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


// Create a cache object
const translationCache = {};

async function translateText(text, targetLang = 'zh-CN') {
    // Check if the translation is already in the cache
    const cacheKey = `${text}-${targetLang}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    const subscriptionKey = 'a6097f5c947645acbd0544bd9fdbd3e1'; // Replace with your subscription key
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
    const location = 'eastasia'; // Replace with your resource location

    const url = `${endpoint}&to=${targetLang}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify([{ Text: text }]),
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data[0].translations[0].text;

        // Store the translation in the cache
        translationCache[cacheKey] = translatedText;

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}


initializeSpeechSDK();


async function toggleBilingualMode(mainArticle) {
    const bilingualSwitch = document.getElementById('bilingual-switch');
    const loadingStatus = document.getElementById('loading-status');

    if (bilingualSwitch.checked) {
        // Show loading status
        loadingStatus.style.display = 'block';

        const paragraphs = mainArticle.querySelectorAll('p.original-paragraph');
        for (const paragraph of paragraphs) {
            if (!paragraph.classList.contains('translated')) {
                const translation = await translateText(paragraph.textContent);
                if (translation) {
                    const translationElement = document.createElement('p');
                    translationElement.className = 'translation';
                    translationElement.textContent = translation;
                    translationElement.style.display = 'none'; // Initially hide the translation

                    paragraph.insertAdjacentElement('afterend', translationElement);
                    paragraph.classList.add('translated');
                }
            }
        }

        // Show all translations
        const translations = mainArticle.querySelectorAll('.translation');
        translations.forEach(translation => {
            translation.style.display = 'block';
        });

        // Hide loading status
        loadingStatus.style.display = 'none';
    } else {
        // Hide all translations
        const translations = mainArticle.querySelectorAll('.translation');
        translations.forEach(translation => {
            translation.style.display = 'none';
        });
    }
}
