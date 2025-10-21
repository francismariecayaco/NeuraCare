
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { connectLive } from '../services/geminiService';
import type { LiveServerMessage, LiveSession } from "@google/genai";
import Icon from './Icon';

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


interface Transcription {
    text: string;
    author: 'user' | 'model';
    isFinal: boolean;
}


const LiveConversation: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // For playback
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const addOrUpdateTranscription = (text: string, author: 'user' | 'model', isFinal: boolean) => {
        setTranscriptions(prev => {
            const last = prev[prev.length - 1];
            if (last && last.author === author && !last.isFinal) {
                const updated = [...prev];
                updated[prev.length - 1] = { ...last, text: last.text + text };
                return updated;
            }
            return [...prev, { text, author, isFinal }];
        });
    };

    const markLastTranscriptionFinal = (author: 'user' | 'model') => {
        setTranscriptions(prev => {
            const last = prev[prev.length - 1];
            if (last && last.author === author && !last.isFinal) {
                const updated = [...prev];
                updated[prev.length - 1] = { ...last, isFinal: true };
                return updated;
            }
            return prev;
        })
    }


    const startConversation = async () => {
        setIsConnecting(true);
        setTranscriptions([]);
        
        try {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            sessionPromiseRef.current = connectLive({
                onopen: () => {
                    if (!audioContextRef.current || !streamRef.current) return;
                    sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    sourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    setIsConnecting(false);
                    setIsActive(true);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        setIsModelSpeaking(true);
                        const ctx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        
                        source.addEventListener('ended', () => {
                            audioQueueRef.current.delete(source);
                            if(audioQueueRef.current.size === 0) {
                                setIsModelSpeaking(false);
                            }
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioQueueRef.current.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        for (const source of audioQueueRef.current.values()) {
                            source.stop();
                        }
                        audioQueueRef.current.clear();
                        nextStartTimeRef.current = 0;
                        setIsModelSpeaking(false);
                    }

                    if (message.serverContent?.inputTranscription) {
                        addOrUpdateTranscription(message.serverContent.inputTranscription.text, 'user', false);
                    }
                    if (message.serverContent?.outputTranscription) {
                        addOrUpdateTranscription(message.serverContent.outputTranscription.text, 'model', false);
                    }
                    if (message.serverContent?.turnComplete) {
                        markLastTranscriptionFinal('user');
                        markLastTranscriptionFinal('model');
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    stopConversation();
                },
                onclose: (e: CloseEvent) => {
                    stopConversation();
                }
            });
            await sessionPromiseRef.current;
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setIsConnecting(false);
        }
    };
    
    const stopConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        sourceRef.current?.disconnect();
        audioContextRef.current?.close();

        outputAudioContextRef.current?.close();
        audioQueueRef.current.clear();
        nextStartTimeRef.current = 0;

        setIsActive(false);
        setIsConnecting(false);
        setIsModelSpeaking(false);
    }, []);

    useEffect(() => {
        return () => {
           if(isActive) stopConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Talk with Neura</h2>
            <p className="text-gray-600 mb-6">Start a real-time voice conversation with your AI wellness companion. Speak freely and let your thoughts flow.</p>
            
            <div className="flex justify-center items-center mb-6">
                <button
                    onClick={isActive ? stopConversation : startConversation}
                    disabled={isConnecting}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white shadow-lg disabled:bg-gray-400`}
                >
                    {isConnecting ? (
                        <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                    ) : (
                        <Icon name="microphone" className="w-10 h-10" />
                    )}
                </button>
            </div>
            
            <div className="text-lg font-medium text-gray-700 h-8">
                {isConnecting && 'Connecting...'}
                {isActive && !isModelSpeaking && 'Listening...'}
                {isActive && isModelSpeaking && <span className="flex items-center justify-center">Speaking <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div></span>}
                {!isActive && !isConnecting && 'Press the button to start'}
            </div>
            
            <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg min-h-[200px] max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-700 mb-2">Live Transcript</h3>
                {transcriptions.length > 0 ? (
                    transcriptions.map((t, i) => (
                        <p key={i} className={`${t.author === 'user' ? 'text-blue-600' : 'text-gray-800'} ${t.isFinal ? 'opacity-100' : 'opacity-60'}`}>
                            <span className="font-bold capitalize">{t.author}: </span>{t.text}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-400 italic">Transcript will appear here...</p>
                )}
            </div>
        </div>
    );
};

export default LiveConversation;
