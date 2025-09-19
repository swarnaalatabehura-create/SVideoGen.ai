/* tslint:disable */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GenerateVideosParameters, GoogleGenAI, Modality} from '@google/genai';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// FIX: Add declarations for DOM types not being recognized in the build environment
declare var document: any;
declare var alert: any;
declare var File: any;
declare var FileReader: any;
declare var Blob: any;
declare var URL: any;
type HTMLButtonElement = any;
type HTMLTextAreaElement = any;
type HTMLInputElement = any;
type HTMLSelectElement = any;
type HTMLDivElement = any;
type HTMLParagraphElement = any;
type HTMLImageElement = any;
type HTMLAnchorElement = any;
type HTMLElement = any;
type HTMLAudioElement = any;
type HTMLVideoElement = any;


// --- PRE-LOADED ASSETS ---

// Base64 for the pre-loaded image of the woman on the mountain
const PRELOADED_IMAGE_BASE64 = `iVBORw0KGgoAAAANSUhEUgAAAoAAAAKACAYAAABn9ovZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAFlKSURBVHhe7J1JlB1Ffcfv23t2ds89d890T/f0dPf0vN05kEBCgAQCAgEEgkQCggQRbFzAYFzASRz5jSsuMh7iKgzEoq5IiyAyKAiCrIIiI56KCIIg6+7u6enp6dlh3v2q6qa7Z7p7dhKEBzw8wD3d6e6pmp6+b/p+ff/P00FERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER- ....`;

// Default prompt based on user's request
const DEFAULT_PROMPT = {
  "scene": 1,
  "duration": "8s",
  "visual_style": "natural cinematic vlog",
  "camera": {
    "type": "selfie",
    "movement": "handheld, slight shake, walking forward"
  },
  "character": {
    "name": "Libra",
    "appearance": "young woman, casual hiking outfit, smiling, holding selfie stick",
    "action": "looks into the camera, adjusts the phone, starts walking uphill"
  },
  "background": {
    "setting": "mountain trail with rolling green hills and soft evening light",
    "details": "wildflowers and rocks along the path, golden sunlight"
  },
  "dialogue": {
    "text": "Hi friends, my name is Libra, I am an AI and I was created by Swarnalata B...",
    "tone": "cheerful, warm"
  },
  "mood": "bright, welcoming, adventurous"
};

const PROMPT_SNIPPETS = {
    camera: `
"camera": {
  "type": "close-up",
  "movement": "pan right"
},`,
    character: `
"character": {
  "name": "Alex",
  "emotion": "surprised",
  "action": "looks up from a book"
},`,
    transition: `
"transition": {
  "type": "fade to black",
  "duration": "1s"
}`
};

const PROMPT_EXAMPLES = {
    action: {
      "scene": 1,
      "duration": "5s",
      "description": "A character is running through a futuristic city at night.",
      "character": {
        "name": "Kael",
        "emotion": "determined",
        "action": "sprinting and dodging obstacles"
      },
      "camera": {
        "type": "tracking shot",
        "movement": "follows the character from the side"
      },
      "background": { "setting": "neon-lit city streets with flying vehicles" },
      "dialogue": {
        "text": "I can't let them get away!",
        "voice": "A determined, male voice with a standard US English accent.",
        "captions": "display dialogue text as burned-in lower-third captions"
      },
      "transition": { "type": "hard cut" }
    },
    emotional: {
        "scene": 2,
        "duration": "7s",
        "description": "Two friends have a heartfelt conversation on a park bench.",
        "characters": [
            { "name": "Maya", "emotion": "wistful", "action": "staring into the distance" },
            { "name": "Leo", "emotion": "comforting", "action": "places a hand on Maya's shoulder" }
        ],
        "camera": {
            "type": "medium shot",
            "movement": "slow zoom in on their faces"
        },
        "background": { "setting": "a quiet park at sunset" },
        "dialogue": {
            "text": "It's okay. We'll figure this out together.",
            "voice": "A soft, comforting male voice with a UK English accent.",
            "captions": "display dialogue text as burned-in lower-third captions"
        }
    },
    vlog: {
      "scene": 1,
      "duration": "8s",
      "visual_style": "natural cinematic vlog",
      "camera": {
        "type": "selfie",
        "movement": "handheld, slight shake, walking forward"
      },
      "character": {
        "name": "Libra",
        "appearance": "young woman, casual hiking outfit, smiling, holding selfie stick",
        "action": "looks into the camera, adjusts the phone, starts walking uphill"
      },
      "background": {
        "setting": "mountain trail with rolling green hills and soft evening light",
        "details": "wildflowers and rocks along the path, golden sunlight"
      },
      "dialogue": {
        "text": "Hi friends, my name is Libra, I am an AI and I was created by Swarnalata B...",
        "tone": "cheerful, warm",
        "voice": "A clear, female voice with a standard US English accent.",
        "captions": "display dialogue text as burned-in lower-third captions"
      },
      "mood": "bright, welcoming, adventurous"
    },
};

const MUSIC_LIBRARY = [
  { name: "Cinematic Score", url: "https://cdn.pixabay.com/audio/2023/11/23/audio_855a0a3014.mp3" },
  { name: "Upbeat & Fun", url: "https://cdn.pixabay.com/audio/2022/08/03/audio_eb7738c8b6.mp3" },
  { name: "Epic & Dramatic", url: "https://cdn.pixabay.com/audio/2024/05/13/audio_33cfb73361.mp3" },
  { name: "Calm & Relaxing", url: "https://cdn.pixabay.com/audio/2022/11/17/audio_81fa5233a8.mp3" },
  { name: "Mysterious", url: "https://cdn.pixabay.com/audio/2024/02/09/audio_d92a6c8b18.mp3" }
];

const LOADING_MESSAGES = [
    "Warming up the cameras...",
    "Warming up the microphone...",
    "Composing the perfect shot...",
    "Adjusting the lighting...",
    "Rolling sound...",
    "Action!",
    "Running safety checks...",
    "Applying cinematic effects...",
    "Rendering the final cut...",
];

// --- APPLICATION STATE ---
let ai: GoogleGenAI;
const ffmpeg = new FFmpeg();
let ffmpegLoaded = false;
let currentVideoBlob: Blob | null = null;
let currentImageBase64: string = PRELOADED_IMAGE_BASE64;
// FIX: Changed type from number to any to support both browser (number) and Node (Timeout) return types from setInterval.
let messageInterval: any;


/**
 * Converts a File object to a base64 encoded string.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Manages the UI state, disabling/enabling controls and showing status.
 */
function setUIState(state: 'idle' | 'loading' | 'success' | 'error', message = '') {
    const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
    const downloadButton = document.getElementById('download-button') as HTMLButtonElement;
    const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const musicSelect = document.getElementById('music-select') as HTMLSelectElement;
    const voiceSelect = document.getElementById('voice-select') as HTMLSelectElement;

    const spinner = document.getElementById('spinner') as HTMLDivElement;
    const status = document.getElementById('status') as HTMLParagraphElement;
    const thumbnailPreview = document.getElementById('thumbnail-preview') as HTMLImageElement;


    const controls = [generateButton, promptInput, fileInput, musicSelect, voiceSelect];

    // Clear message interval if it exists
    if (messageInterval) clearInterval(messageInterval);

    if (state === 'loading') {
        controls.forEach(el => el.disabled = true);
        spinner.style.display = 'block';
        status.textContent = message || 'Generating, please wait...';
        thumbnailPreview.style.display = 'none';
        downloadButton.style.display = 'none';

        // Start cycling through loading messages
        let messageIndex = 0;
        status.textContent = LOADING_MESSAGES[messageIndex];
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
            status.textContent = LOADING_MESSAGES[messageIndex];
        }, 3000);

    } else {
        controls.forEach(el => el.disabled = false);
        spinner.style.display = 'none';
        status.textContent = message;

        if (state === 'idle') {
            thumbnailPreview.style.display = 'none';
            downloadButton.style.display = 'none';
            status.style.display = 'block';
        } else if (state === 'success') {
            thumbnailPreview.style.display = 'block';
            downloadButton.style.display = 'block';
            downloadButton.disabled = false;
            status.style.display = 'none'; // Hide status text on success
        } else if (state === 'error') {
            thumbnailPreview.style.display = 'none';
            downloadButton.style.display = 'none';
            status.style.display = 'block';
        }
    }
}

/**
 * Downloads a Blob object as a file.
 */
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Loads the FFmpeg library.
 */
async function loadFFmpeg() {
  if (ffmpegLoaded) return;
  const status = document.getElementById('status') as HTMLParagraphElement;
  status.textContent = 'Initializing audio engine...';
  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });
    ffmpegLoaded = true;
    console.log('FFmpeg loaded.');
    status.textContent = 'Your generated video will appear here. Click "Generate" to start.';
  } catch (err) {
    console.error('Failed to load FFmpeg', err);
    status.textContent = 'Could not load audio features. Video generation is still available.';
  }
}

/**
 * Merges video and audio using FFmpeg.
 */
async function mergeAudioAndVideo(videoBlob: Blob, audioUrl: string) {
    const downloadButton = document.getElementById('download-button') as HTMLButtonElement;
    downloadButton.disabled = true;
    setUIState('loading', 'Preparing for merge...');

    try {
        const videoData = new Uint8Array(await videoBlob.arrayBuffer());
        setUIState('loading', 'Downloading audio...');
        const audioData = await fetchFile(audioUrl);

        setUIState('loading', 'Writing files to memory...');
        await ffmpeg.writeFile('input.mp4', videoData);
        await ffmpeg.writeFile('input.mp3', audioData);

        setUIState('loading', 'Merging audio & video... (This may take a minute)');
        // Lower background music volume to make voiceover audible if present
        await ffmpeg.exec(['-i', 'input.mp4', '-i', 'input.mp3', '-filter_complex', '[0:a]volume=1.0[a0];[1:a]volume=0.3[a1];[a0][a1]amix=inputs=2:duration=longest', '-c:v', 'copy', 'output.mp4']);

        setUIState('loading', 'Finalizing output...');
        const data = await ffmpeg.readFile('output.mp4');

        const mergedBlob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
        downloadBlob(mergedBlob, 'final_video_with_music.mp4');
        setUIState('success'); // Return to success state
    } catch (err) {
        console.error('Error during ffmpeg merge:', err);
        setUIState('error', 'Failed to merge audio. You can still download the original video.');
        // In case of error, still allow downloading original video
        downloadButton.style.display = 'block';
        downloadButton.disabled = false;
    }
}


/**
 * Handles the download button click.
 */
async function handleDownloadClick() {
    if (!currentVideoBlob) {
        console.error('No video blob available to download.');
        setUIState('error', 'An error occurred. No video to download.');
        return;
    }

    const musicSelect = document.getElementById('music-select') as HTMLSelectElement;
    const selectedMusicUrl = musicSelect.value;

    if (!selectedMusicUrl) {
        // No music selected, just download the video
        downloadBlob(currentVideoBlob, 'video.mp4');
    } else {
        // Music selected, merge with ffmpeg
        if (!ffmpegLoaded) {
            alert('The audio engine is still loading. Please wait a moment and try again.');
            return;
        }
        await mergeAudioAndVideo(currentVideoBlob, selectedMusicUrl);
    }
}


/**
 * Main function to handle the video generation process.
 */
async function handleGenerateClick() {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not set in environment variables.");
    }
    ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
    const voiceSelect = document.getElementById('voice-select') as HTMLSelectElement;
    let prompt = promptInput.value;

    if (!prompt || !currentImageBase64) {
      alert('Please provide a prompt and an image.');
      return;
    }

    // --- Intelligent Prompt Modification ---
    const selectedVoice = voiceSelect.value;
    if (selectedVoice) {
        try {
            const promptObj = JSON.parse(prompt);
            if (promptObj.dialogue && typeof promptObj.dialogue === 'object') {
                promptObj.dialogue.voice = selectedVoice;
                // Also add a request for captions
                promptObj.dialogue.captions = "display dialogue text as burned-in lower-third captions";
                prompt = JSON.stringify(promptObj, null, 2);
                promptInput.value = prompt; // Update the UI
                console.log("Modified prompt with voice and captions request:", prompt);
            }
        } catch (e) {
            console.warn("Could not parse prompt as JSON to add voice. Sending original prompt.", e);
        }
    }

    setUIState('loading');

    const generateVideosParams: GenerateVideosParameters = {
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: currentImageBase64,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
      },
    };

    let operation = await ai.models.generateVideos(generateVideosParams);

    // Poll for video generation completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error('Video generation failed or returned no URI.');
    }

    const downloadLink = operation.response.generatedVideos[0].video.uri;

    // Fetch the video and store it as a blob
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    currentVideoBlob = await videoResponse.blob();

    // --- Thumbnail Generation ---
    setUIState('loading', 'Generating thumbnail...');
    const videoElement = document.getElementById('video') as HTMLVideoElement;
    const videoUrl = URL.createObjectURL(currentVideoBlob);
    videoElement.src = videoUrl;

    await new Promise<void>((resolve) => {
        videoElement.onloadeddata = () => {
            videoElement.currentTime = 0.1; // Seek to the first frame
        };
        videoElement.onseeked = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx!.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const frameBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

            // Use Gemini to enhance the thumbnail
             const thumbnailResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: frameBase64, mimeType: 'image/jpeg' } },
                        { text: 'Enhance this image to be a beautiful, eye-catching, cinematic video thumbnail. Improve lighting and color.' },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePart = thumbnailResponse.candidates[0].content.parts.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData) {
                const thumbnailPreview = document.getElementById('thumbnail-preview') as HTMLImageElement;
                thumbnailPreview.src = `data:image/png;base64,${imagePart.inlineData.data}`;
            }

            URL.revokeObjectURL(videoUrl); // Clean up
            resolve();
        };
    });

    setUIState('success');

  } catch (e: any) {
    console.error(e);
    setUIState('error', `An error occurred: ${e.message}`);
  }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
    const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
    const showExamplesLink = document.getElementById('show-examples-link') as HTMLAnchorElement;
    const examplesContainer = document.getElementById('prompt-examples-container') as HTMLDivElement;
    const downloadButton = document.getElementById('download-button') as HTMLButtonElement;
    const musicSelect = document.getElementById('music-select') as HTMLSelectElement;
    const audioPreview = document.getElementById('audio-preview') as HTMLAudioElement;

    // Set pre-loaded assets
    imagePreview.src = `data:image/jpeg;base64,${PRELOADED_IMAGE_BASE64}`;
    promptInput.value = JSON.stringify(DEFAULT_PROMPT, null, 2);

    // Event Listeners
    generateButton.addEventListener('click', handleGenerateClick);
    downloadButton.addEventListener('click', handleDownloadClick);

    fileInput.addEventListener('change', async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            currentImageBase64 = await fileToBase64(file);
            imagePreview.src = URL.createObjectURL(file);
        }
    });

    // Prompt composer tools
    showExamplesLink.addEventListener('click', (e) => {
        e.preventDefault();
        examplesContainer.style.display = examplesContainer.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.prompt-snippet-btn').forEach(button => {
        button.addEventListener('click', () => {
            const snippetKey = (button as HTMLElement).dataset.snippet as keyof typeof PROMPT_SNIPPETS;
            const snippet = PROMPT_SNIPPETS[snippetKey];
            const { selectionStart, selectionEnd } = promptInput;
            promptInput.value = promptInput.value.substring(0, selectionStart) + snippet + promptInput.value.substring(selectionEnd);
            promptInput.focus();
            promptInput.selectionStart = promptInput.selectionEnd = selectionStart + snippet.length;
        });
    });

    document.querySelectorAll('.prompt-example').forEach(li => {
        li.addEventListener('click', () => {
            const exampleKey = (li as HTMLElement).dataset.example as keyof typeof PROMPT_EXAMPLES;
            const example = PROMPT_EXAMPLES[exampleKey];
            promptInput.value = JSON.stringify(example, null, 2);
            examplesContainer.style.display = 'none';
        });
    });

     // Populate music library
    MUSIC_LIBRARY.forEach(track => {
        const option = document.createElement('option');
        option.value = track.url;
        option.textContent = track.name;
        musicSelect.appendChild(option);
    });

    // Music preview listener
    musicSelect.addEventListener('change', () => {
        const selectedUrl = musicSelect.value;
        if (selectedUrl) {
        audioPreview.src = selectedUrl;
        audioPreview.style.display = 'block';
        audioPreview.play();
        } else {
        audioPreview.style.display = 'none';
        audioPreview.pause();
        audioPreview.src = '';
        }
    });


    // Initial UI State
    setUIState('idle', 'Your generated video will appear here. Click "Generate" to start.');

    // Load FFmpeg in the background
    loadFFmpeg();
});