import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaVideo, FaArrowRight, FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";

const AIInterviewDetail = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showAnswerPrompt, setShowAnswerPrompt] = useState(false);
  const [micError, setMicError] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const listeningTimeoutRef = useRef(null);
  const questionIndexRef = useRef(0); // Track currentQuestionIndex for async safety

  // Initialize media stream
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          setIsCameraReady(true);
        }
      } catch (error) {
        console.error("Media error:", error);
        toast.error("Camera or microphone access is required");
        setIsCameraReady(true); // Allow proceeding without video
      }
    };

    startMedia();
    return () => {
      stopMedia();
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Fetch interview data
  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied");
      navigate("/");
      return;
    }

    const fetchInterview = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/ai-interview/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });

        if (res.data.success) {
          const fetchedInterview = res.data.data;
          setInterview(fetchedInterview);
          const initialResponses = fetchedInterview.questions.map((question, index) => ({
            questionIndex: index,
            questionId: question._id,
            answer: "",
          }));
          setResponses(initialResponses);
          console.log("Initialized responses:", initialResponses);
        } else {
          toast.error("Unable to load interview");
          navigate("/user/ai-interview/take-test");
        }
      } catch (err) {
        console.error("Fetch interview error:", err);
        toast.error("Interview not found");
        navigate("/user/ai-interview/take-test");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [backendUrl, id, navigate, userData]);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        const index = questionIndexRef.current; // Use ref for async safety
        const questionText = interview?.questions[index]?.text || "Unknown";
        console.log(`Captured transcript for question ${index} (${questionText}):`, transcript);
        setResponses(prev => {
          const newResponses = [...prev];
          newResponses[index] = {
            questionIndex: index,
            questionId: interview?.questions[index]?._id || "",
            answer: transcript || "No clear speech detected",
          };
          console.log("Updated responses:", newResponses);
          return newResponses;
        });
        setCurrentResponse(transcript || "No clear speech detected");
        if (transcript) {
          toast.success(`Response captured for question ${index + 1}`);
        } else {
          toast.warn("No clear speech detected");
        }
        setIsListening(false);
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error(`Speech recognition error for question ${questionIndexRef.current}:`, event.error);
        setMicError(true);
        setIsListening(false);
        setShowAnswerPrompt(false);
        toast.error(`Microphone error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        console.log(`Speech recognition ended for question ${questionIndexRef.current}`);
        setIsListening(false);
        setShowAnswerPrompt(false);
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current);
        }
      };
    } catch (err) {
      console.error("Speech recognition initialization error:", err);
      toast.error("Failed to initialize speech recognition");
    }
  };

  // Initialize speech recognition only once
  useEffect(() => {
    initializeSpeechRecognition();
  }, []);

  // Speak question and handle flow
  useEffect(() => {
    if (!interview || !isCameraReady || loading) return;

    // Reset states for new question
    setShowAnswerPrompt(false);
    setIsListening(false);
    setIsSpeaking(false);
    setMicError(false);
    setCurrentResponse(responses[currentQuestionIndex]?.answer || "");
    questionIndexRef.current = currentQuestionIndex; // Sync ref

    // Stop any ongoing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Speak question
    const question = interview.questions?.[currentQuestionIndex]?.text;
    if (question) {
      console.log(`Speaking question ${currentQuestionIndex}:`, question);
      speakQuestion(question);
    } else {
      console.error("No question text found");
      triggerAnswerPrompt();
    }

  }, [currentQuestionIndex, interview, isCameraReady, loading]);

  const speakQuestion = (text) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported");
      triggerAnswerPrompt();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      triggerAnswerPrompt();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      triggerAnswerPrompt();
      toast.error("Error speaking question");
    };

    window.speechSynthesis.speak(utterance);
  };

  const triggerAnswerPrompt = () => {
    setShowAnswerPrompt(true);
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;

    try {
      console.log(`Starting listening for question ${questionIndexRef.current}`);
      recognitionRef.current.start();
      setIsListening(true);
      setMicError(false);

      listeningTimeoutRef.current = setTimeout(() => {
        console.log(`Timeout triggered for question ${questionIndexRef.current}`);
        if (isListening && recognitionRef.current) {
          recognitionRef.current.stop();
          setResponses(prev => {
            const newResponses = [...prev];
            const index = questionIndexRef.current;
            if (!newResponses[index]?.answer?.trim()) {
              newResponses[index] = {
                questionIndex: index,
                questionId: interview?.questions[index]?._id || "",
                answer: "No response recorded",
              };
              console.log("Timeout updated responses:", newResponses);
              return newResponses;
            }
            return prev;
          });
          setCurrentResponse(prev => prev || "No response recorded");
          toast.warn("No response recorded after 60 seconds");
        }
      }, 60000);
    } catch (error) {
      console.error(`Start listening error for question ${questionIndexRef.current}:`, error);
      setMicError(true);
      setIsListening(false);
      setShowAnswerPrompt(false);
      toast.error("Failed to start listening");
    }
  };

  const handleNextQuestion = () => {
    if (isSpeaking || isListening) {
      toast.warn("Please wait until the AI finishes speaking or listening");
      return;
    }

    // Persist current response
    setResponses(prev => {
      const newResponses = [...prev];
      const index = currentQuestionIndex;
      const currentAnswer = currentResponse?.trim();
      if (currentAnswer && currentAnswer !== "No clear speech detected" && currentAnswer !== "No response recorded") {
        newResponses[index] = {
          questionIndex: index,
          questionId: interview?.questions[index]?._id || "",
          answer: currentAnswer,
        };
        console.log(`Persisted response for question ${index}:`, newResponses);
      } else if (!newResponses[index]?.answer?.trim()) {
        newResponses[index] = {
          questionIndex: index,
          questionId: interview?.questions[index]?._id || "",
          answer: "No response provided",
        };
        console.log(`Set no response provided for question ${index}:`, newResponses);
      }
      return newResponses;
    });

    // Move to next question or submit
    if (currentQuestionIndex < (interview?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => {
        const nextIndex = prev + 1;
        console.log(`Moving to question ${nextIndex}`);
        setCurrentResponse(""); // Clear for next question
        return nextIndex;
      });
    } else {
      submitInterview();
    }
  };

  const submitInterview = async () => {
    if (!interview) {
      toast.error("No interview data available");
      return;
    }

    try {
      // Finalize responses
      const responsePayload = interview.questions.map((question, idx) => {
        const answer = responses[idx]?.answer?.trim() || "No response provided";
        console.log(`Question ${idx} (${question.text}):`, answer);
        return {
          questionIndex: idx,
          questionId: question._id,
          answer,
          timestamp: new Date(),
        };
      });

      console.log("Submission payload:", responsePayload);

      const hasValidResponse = responsePayload.some(
        res =>
          res.answer &&
          res.answer !== "No response provided" &&
          res.answer !== "No response recorded" &&
          res.answer !== "No clear speech detected"
      );

      if (!hasValidResponse) {
        toast.error("Please provide at least one valid answer before submitting");
        return;
      }

      const res = await axios.post(
        `${backendUrl}/api/user/ai-interview/${id}/response`,
        {
          responses: responsePayload,
          status: "completed",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Interview submitted successfully!");
        stopMedia();
        navigate("/user/ai-interview/feedback", {
          state: {
            interviewId: id,
            responses: responsePayload,
            questions: interview.questions,
          },
        });
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Error submitting interview");
    }
  };

  if (userData?.role !== "student") return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 pt-10">
      <motion.div
        className="max-w-4xl mx-auto rounded-xl shadow-lg p-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white mt-[60px]"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
          <FaRobot className="mr-4 text-teal-200 text-5xl" /> AI Interview
        </h1>
        <p className="mt-3 text-lg text-center text-teal-100 opacity-90">
          Listen to the question and speak your response
        </p>
      </motion.div>

      <motion.div
        className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse">Loading...</p>
        ) : !interview ? (
          <p className="text-center text-gray-600 text-lg">No interview found</p>
        ) : interview.status === "completed" ? (
          <p className="text-center text-green-500 text-lg">Interview already completed</p>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full rounded-lg shadow-sm"
                style={{ maxHeight: "300px" }}
              />
              {isCameraReady && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
                  <FaVideo className="mr-1" /> Recording
                </div>
              )}
              {isListening && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center">
                  <FaMicrophone className="mr-1" /> Listening...
                </div>
              )}
            </div>

            <motion.div
              key={`question-${currentQuestionIndex}`}
              className="bg-gray-100 p-6 rounded-lg shadow-sm relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xl font-semibold text-teal-700 mb-3">
                {interview.questions?.[currentQuestionIndex]?.text || "Loading question..."}
              </p>

              {showAnswerPrompt && (
                <>
                  <p className="text-3xl font-bold text-red-500 text-center mb-4 animate-pulse">
                    NOW ANSWER
                  </p>
                  {micError && (
                    <button
                      onClick={startListening}
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
                    >
                      <FaMicrophoneAlt className="mr-2" /> Retry Microphone
                    </button>
                  )}
                </>
              )}

              <p className="text-center text-lg font-medium text-gray-700 min-h-[2rem]">
                {isSpeaking
                  ? "AI is asking the question..."
                  : isListening
                  ? "Listening for your response..."
                  : currentResponse
                  ? `Your response: ${currentResponse}`
                  : showAnswerPrompt
                  ? "Please speak your answer now"
                  : "Waiting for question..."}
              </p>
            </motion.div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleNextQuestion}
                disabled={isSpeaking || isListening}
                className={`flex items-center px-6 py-3 rounded-md transition duration-300 ${
                  isSpeaking || isListening
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-500 text-white"
                }`}
              >
                {currentQuestionIndex < (interview?.questions.length || 0) - 1
                  ? "Next Question"
                  : "Submit Interview"}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIInterviewDetail;