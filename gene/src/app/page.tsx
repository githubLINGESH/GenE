"use client";
import { useEffect, useRef, useState } from "react";
import useLLM, { OpenAIMessage } from "usellm";
import axios from 'axios';

export default function AIChatBot() {
  const [status, setStatus] = useState<Status>("idle");
  const [history, setHistory] = useState<OpenAIMessage[]>([
    {
      role: "assistant",
      content:
        "I'm a chatbot powered by the ChatGPT API and developed using useLLM. Ask me anything!",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);

  const llm = useLLM({
    serviceUrl: "https://usellm.org/api/llm",
  });

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTTSRequestInProgress, setIsTTSRequestInProgress] = useState(false);

  const generateAudioWithCoquiTTS = async (text: string) => {
    try {
      if (isTTSRequestInProgress) {
        console.log("TTS request is already in progress. Ignoring the new request.");
        return;
      }
  
      setIsTTSRequestInProgress(true);
  
      const response = await axios.post('http://[::1]:5002/api/tts', null, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          text,
        },
        responseType: 'arraybuffer',
      });
  
      if (response.status === 200) {
        console.log(response);
        setAudioData(response.data);
      } else {
        console.error('Error generating audio:', response.status);
      }
    } catch (error: any) {
      console.error('Error generating audio:', error.message);
    } finally {
      setIsTTSRequestInProgress(false);
    }
  };

  const playAudioData = async (audioData: ArrayBuffer) => {
    try {
      if (!isAudioPlaying) {
        setIsAudioPlaying(true);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)() as AudioContext;
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
          setIsAudioPlaying(false);
        };

        source.start();
      }
    } catch (error: any) {
      console.error('Error playing audio:', error.message);
    }
  };


  async function handleSend() {
    if (!inputText) {
      return;
    }
    try {
      setStatus("streaming");
      const newHistory = [...history, { role: "user", content: inputText }];
      setHistory(newHistory);
      setInputText("");
      const { message } = await llm.chat({
        messages: newHistory,
        stream: true,
        onStream: ({ message }) => {
        setHistory([...newHistory, message]);
        generateAudioWithCoquiTTS(message.content);
        }
      });
      setHistory([...newHistory, message]);
      setStatus("idle");
    } catch (error: any) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }
  

  async function handleRecordClick() {
    try {
      if (status === "idle") {
        await llm.record();
        setStatus("recording");
      } else if (status === "recording") {
        setStatus("transcribing");
        const { audioUrl } = await llm.stopRecording();
        const { text } = await llm.transcribe({ audioUrl });
        setStatus("streaming");
        const newHistory = [...history, { role: "user", content: text }];
        setHistory(newHistory);
        const { message } = await llm.chat({
          messages: newHistory,
          stream: true,
          onStream: ({ message }) => setHistory((prevHistory) => [...prevHistory, message]),
        });
        setHistory((prevHistory) => [...prevHistory, message]);
        setStatus("idle");
      }
    } catch (error: any) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }

  const Icon = status === "recording" ? Square : Mic;

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-y-hidden">
      <ChatMessages messages={history} />
      <div className="w-full pb-4 flex px-4">
        <ChatInput
          placeholder={getInputPlaceholder(status)}
          text={inputText}
          setText={setInputText}
          sendMessage={handleSend}
          disabled={status !== "idle"}
        />
        <button
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
          onClick={handleSend}
        >
          Send
        </button>
        <button
          className="p-2 border rounded bg-gray-100 hover.bg-gray-200 active.bg-gray-300 dark.bg-white dark.text-black font-medium ml-2"
          onClick={handleRecordClick}
        >
          <Icon />
        </button>

        <button
          className="p-2 border rounded bg-gray-100 hover.bg-gray-200 active.bg-gray-300 dark.bg-white dark.text-black font-medium ml-2"
          onClick={() => {
            if (audioData) {
              playAudioData(audioData);
            }
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}

const Mic = () => (
  // you can also use an icon library like `react-icons` here
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" x2="12" y1="19" y2="22"></line>
  </svg>
);

const Square = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  </svg>
);

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

type Status = "idle" | "recording" | "transcribing" | "streaming";

function getInputPlaceholder(status: Status) {
  switch (status) {
    case "idle":
      return "Ask me anthing...";
    case "recording":
      return "Recording audio...";
    case "transcribing":
      return "Transcribing audio...";
    case "streaming":
      return "Wait for my response...";
  }
}

interface ChatMessagesProps {
  messages: OpenAIMessage[];
}

function ChatMessages({ messages }: ChatMessagesProps) {
  let messagesWindow = useRef<Element | null>(null);

  useEffect(() => {
    if (messagesWindow?.current) {
      messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="w-full flex-1 overflow-y-auto px-4"
      ref={(el) => (messagesWindow.current = el)}
    >
      {messages.map((message, idx) => (
        <div className="my-4" key={idx}>
          <div className="font-semibold text-gray-800 dark:text-white">
            {capitalize(message.role)}
          </div>
          <div className="text-gray-600 dark:text-gray-200 whitespace-pre-wrap mt-1">
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChatInputProps {
  placeholder: string;
  text: string;
  setText: (text: string) => void;
  sendMessage: () => void;
  disabled: boolean;
}

function ChatInput({
  placeholder,
  text,
  setText,
  sendMessage,
  disabled,
}: ChatInputProps) {
  return (
    <input
      className="p-2 border rounded w-full block dark:bg-gray-900 dark:text-white"
      type="text"
      placeholder={placeholder}
      value={text}
      disabled={disabled}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      }}
    />
  );
}