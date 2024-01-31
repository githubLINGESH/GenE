    "use client";
    import axios from 'axios';
    import { useEffect, useRef, useState } from "react";
    import useLLM, { OpenAIMessage } from "usellm";
    import SideNavbar from "../components/SideNavbar";
    import TutorSession from  "../components/TutorSession";
    import './page.css';


    const updateUserDetails = async (userId, details) => {
        await axios.put(`/api/user/${userId}`, details);
        };

    export default function AIChatBot() {

    const [status, setStatus] = useState<Status>("idle");
    const [generatedContent, setGeneratedContent] = useState<string>("");
    const [courseName, setCourseName] = useState("");
    const [history, setHistory] = useState<OpenAIMessage[]>([
        {
            role: "assistant",
            content:
                "Welcome to Course Creation! Use the prompts to generate content or create your own.",
            },
    ]);
    const [inputText, setInputText] = useState("");

    const llm = useLLM({
        serviceUrl: "https://usellm.org/api/llm",
    });

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
                onStream: ({ message }) => setHistory([...newHistory, message]),
            });
            setHistory([...newHistory, message]);
            setStatus("idle");
        
            const lastMessage = newHistory[newHistory.length - 1];
            switch (lastMessage.role) {
                case "assistant":
                // Handle assistant responses as needed
                if (lastMessage.content === "You're ready to upload your course. Confirm the details.") {
                    // Extract the generated content from the assistant's response
                    setGeneratedContent(message.content);
                }
                break;
                default:
                // Handle user responses as needed
                break;
            }
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
            onStream: ({ message }) => setHistory([...newHistory, message]),
            });
            setHistory([...newHistory, message]);
            setStatus("idle");
        }
        } catch (error: any) {
        console.error(error);
        window.alert("Something went wrong! " + error.message);
        }
    }

    const Icon = status === "recording" ? Square : Mic;

    const handleUploadCourse = async (tutor, userId, courseName, generatedContent) => {
        const courseData = {
            tutorId: tutor.tutorId,
            userId: userId,
            courseName: courseName,
            content: generatedContent
        };

        try {
            const response = await axios.post('/api/upload-course', courseData);
            console.log('Course uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading course:', error.message);
        }
    };

        const [isPersonalizationFormOpen, setIsPersonalizationFormOpen] = useState(false);
        const [name, setName] = useState("");
        const [preferences, setPreferences] = useState("");

        // Function to handle personalization button click
        const handlePersonalizationClick = () => {
            setIsPersonalizationFormOpen((prev) => !prev);
            };

        // Function to handle form submission
        const handleFormSubmit = async () => {
            try {
            // Call an API to update user details based on userId
            await updateUserDetails(userId, { name, preferences });

            setIsPersonalizationFormOpen(false);
            } catch (error) {
            console.error("Error updating user details:", error.message);
            }
        };

            const PersonalizationForm = () => (
                <div className="personalization-form">
                <h2>Personalization Form</h2>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="preferences">Preferences:</label>
                    <input
                    type="text"
                    id="preferences"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    className="input-field"
                    />
                </div>
                <div className="form-group">
                    <button onClick={handleFormSubmit} className="submit-button">Submit</button>
                </div>
                </div>
            );
            

            return (
                <div className="flex flex-col h-full max-h-[600px] overflow-y-hidden">
                    <TutorSession
                        tutor
                        userId
                        handleUploadCourse={handleUploadCourse}
                    />
                    <div className="absolute flex top-[62px] left-0 h-full">
                        <SideNavbar />
                    </div>
                <div className="flex w-full h-full">
                    {/* Left side (Usellm Chat) */}
                    <div className="w-1/2 flex flex-col">
                    <button
                    className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
                    onClick={handlePersonalizationClick}
                    >
                        {isPersonalizationFormOpen ? 'Close Personalization' : 'Open Personalization'}
                    </button>

                    {/* Render the PersonalizationForm if it's open */}
                    {isPersonalizationFormOpen && <PersonalizationForm />}
                    <div className="flex-1 overflow-y-auto px-4">
                        <ChatMessages messages={history} />
                    </div>
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
                        className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
                        onClick={handleRecordClick}
                        >
                        <Icon />
                        </button>
                    </div>
                    </div>
            
                    {/* Right side (Course Creation) */}
                    <div className="w-1/2 flex flex-col">
                    <div className="mb-2">
                        <input
                        className="p-2 border rounded w-full dark:bg-gray-900 dark:text-white"
                        type="text"
                        placeholder="Course Name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        />
                    </div>
                    {/* Add AI Avatars and other UI elements for course creation here */}
                    <textarea
                        className="p-2 border rounded w-full h-48 dark:bg-gray-900 dark:text-white"
                        placeholder="Paste 3-4 mins text content here..."
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                    ></textarea>
                    <button
                        className="p-2 border rounded bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium mt-2"
                        onClick={handleUploadCourse}
                    >
                        Upload Course
                    </button>
                    </div>
                </div>
                </div>
            );
            }

    const Mic = () => (
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