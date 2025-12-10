import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FinalResultsLoadingScreen from "./FinalResultsLoadingScreen";
import "./ChatSimulation.css";

function ChatSimulation() {
  const navigate = useNavigate();
  const location = useLocation();
  const professor = location.state?.professor;
  const applicantData = location.state?.applicantData;
  const professorsData = location.state?.professorsData;
  const sessionData = location.state?.sessionData;

  // 디버깅: 전달받은 데이터 확인
  console.log("ChatSimulation - Professor:", professor);
  console.log("ChatSimulation - ProfessorsData:", professorsData);

  // 교수님 목록 조회 API에서 받은 해당 교수님 정보 찾기
  const professorInfo = professorsData?.professors?.find(
    (p) => p.professor_id === professor?.professor_id
  );

  console.log("ChatSimulation - ProfessorInfo:", professorInfo);

  // 응답 텍스트 포맷팅 함수 (마침표 기준 줄바꿈)
  const formatResponse = (text) => {
    if (!text) return "";

    // 마침표 뒤에 공백이 있으면 줄바꿈 추가
    // 연속된 공백 제거 및 정리
    return text
      .replace(/\.\s+/g, ".\n") // 마침표 뒤 공백을 줄바꿈으로
      .replace(/\n\s+/g, "\n") // 줄바꿈 뒤 공백 제거
      .trim();
  };

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFinalResults, setIsLoadingFinalResults] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showProfessorScrollIndicator, setShowProfessorScrollIndicator] =
    useState(false);
  const paperListRef = useRef(null);
  const professorCardRef = useRef(null);

  // 질문 프리셋
  const questionPresets = [
    "교수님의 연구 분야에 대해 더 자세히 알고 싶습니다.",
    "제가 관심 있는 연구 주제와 교수님의 연구 방향이 잘 맞는지 궁금합니다.",
    "연구실의 분위기와 협업 방식에 대해 궁금합니다.",
    "학위 과정 중 어떤 역량을 기르는 것이 중요할까요?",
    "교수님께서 학생에게 가장 중요하게 생각하시는 자질은 무엇인가요?",
  ];

  const handlePresetClick = (preset) => {
    setInputMessage(preset);
  };

  const handleGoBack = () => {
    navigate("/results", {
      state: {
        professor: professor,
        applicantData: applicantData,
      },
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // API Base URL
    const API_BASE_URL = "https://api.advisor-ai.net:8000";

    // 사용자 메시지 추가
    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const messageText = inputMessage;
    setInputMessage("");

    // 로딩 상태 시작
    setIsLoading(true);
    const loadingMessageId = Date.now() + 1;
    const loadingMessage = {
      id: loadingMessageId,
      text: "",
      sender: "professor",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // sessionData 확인
      console.log("Session Data for chat:", sessionData);

      // API 요청 본문 구성
      const chatSessionId =
        sessionData?.session_id ||
        sessionData?.id ||
        sessionData?.data?.session_id ||
        1;
      console.log("Using Session ID for chat:", chatSessionId);

      const requestBody = {
        professor_id: professor?.professor_id,
        question: messageText,
        session_id: chatSessionId,
        top_k: 5,
      };

      // API 호출
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const chatResult = await response.json();

      // 로딩 메시지 제거하고 실제 응답 추가
      const responseText =
        chatResult.answer || chatResult.response || "응답을 받을 수 없습니다.";
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingMessageId)
          .concat({
            id: Date.now() + 2,
            text: responseText,
            formattedText: formatResponse(responseText),
            sender: "professor",
            timestamp: new Date(),
          })
      );
    } catch (error) {
      console.error("채팅 API 오류:", error);
      // 로딩 메시지 제거하고 에러 응답 추가
      const errorText = "죄송합니다. 응답을 받는 중 오류가 발생했습니다.";
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingMessageId)
          .concat({
            id: Date.now() + 2,
            text: errorText,
            formattedText: formatResponse(errorText),
            sender: "professor",
            timestamp: new Date(),
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResults = async () => {
    // API Base URL
    const API_BASE_URL = "https://api.advisor-ai.net:8000";

    // 로딩 상태 시작
    console.log("로딩 시작");
    setIsLoadingFinalResults(true);

    try {
      // sessionData 확인 및 디버깅
      console.log("Session Data:", sessionData);

      // 쿼리 파라미터로 session_id 전달
      // sessionData에서 session_id를 가져오거나, 응답 구조에 따라 다른 필드명 확인
      const sessionId =
        sessionData?.session_id ||
        sessionData?.id ||
        sessionData?.data?.session_id ||
        1;
      console.log("Using Session ID:", sessionId);

      const url = `${API_BASE_URL}/match/final?session_id=${sessionId}`;

      // API 호출
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const finalResults = await response.json();
      console.log("API 응답 받음, 페이지 이동");

      // 로딩 화면이 표시되도록 약간의 딜레이 후 페이지 이동
      setTimeout(() => {
        navigate("/final-results", {
          state: {
            professor: professor,
            applicantData: applicantData,
            finalResults: finalResults, // API 응답 데이터
          },
        });
      }, 100);
    } catch (error) {
      console.error("최종 적합도 분석 API 오류:", error);
      setIsLoadingFinalResults(false);
      // 에러가 발생해도 페이지 이동은 진행 (기존 동작 유지)
      navigate("/final-results", {
        state: {
          professor: professor,
          applicantData: applicantData,
        },
      });
    }
  };

  // 논문 목록 스크롤 가능 여부 및 위치 감지
  useEffect(() => {
    const checkScroll = () => {
      if (paperListRef.current) {
        const element = paperListRef.current;
        const hasScroll = element.scrollHeight > element.clientHeight;
        const isScrolledToBottom =
          element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        setShowScrollIndicator(hasScroll && !isScrolledToBottom);
      }
    };

    // 초기 체크
    checkScroll();

    // 스크롤 이벤트 리스너
    const scrollElement = paperListRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      // ResizeObserver로 크기 변경 감지
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(scrollElement);

      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [professor?.papers]);

  // 교수님 정보 카드 스크롤 가능 여부 및 위치 감지
  useEffect(() => {
    const checkScroll = () => {
      if (professorCardRef.current) {
        const element = professorCardRef.current;
        const hasScroll = element.scrollHeight > element.clientHeight;
        const isScrolledToBottom =
          element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        setShowProfessorScrollIndicator(hasScroll && !isScrolledToBottom);
      }
    };

    // 초기 체크
    checkScroll();

    // 스크롤 이벤트 리스너
    const scrollElement = professorCardRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      // ResizeObserver로 크기 변경 감지
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(scrollElement);

      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [professor]);

  // 로딩 화면 표시 (모든 hooks 호출 후)
  if (isLoadingFinalResults) {
    return <FinalResultsLoadingScreen />;
  }

  // 교수님 정보 없을 때
  if (!professor) {
    return (
      <div className="chat-simulation-page">
        <div className="error-message">
          <p>교수님 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/results")}>
            결과 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const professorName =
    professor?.professor_name || professor?.name || "교수님";

  return (
    <div className="chat-simulation-page">
      <div className="chat-simulation-container">
        {/* Page Title */}
        <div className="page-title-section">
          <h1 className="page-title">Step 3 - AI 대화 시뮬레이션</h1>
        </div>

        <div className="chat-layout">
          {/* Professor Info Card */}
          <div className="professor-info-card">
            <div className="professor-card-header">
              <h2 className="professor-card-name">{professorName} 교수님</h2>
              <p className="professor-card-major">
                {professor?.major || "전공 정보 없음"}
              </p>
            </div>
            <div className="professor-card-details" ref={professorCardRef}>
              <div className="detail-item">
                <span className="detail-label">매칭률</span>
                <span className="detail-value">
                  {professor?.total_score || professor?.matchingRate || 0}%
                </span>
              </div>

              {/* 연구 분야 - API 데이터 사용 */}
              <div className="detail-item">
                <span className="detail-label">연구 분야</span>
                <span className="detail-value">
                  {professorInfo?.research_fields !== null &&
                  professorInfo?.research_fields !== undefined
                    ? professorInfo.research_fields
                    : "null"}
                </span>
              </div>

              {/* 학력 - API 데이터 사용 */}
              {professorInfo?.education !== null &&
              professorInfo?.education !== undefined ? (
                <div className="detail-section">
                  <span className="detail-section-label">학력</span>
                  <div className="detail-section-content">
                    {typeof professorInfo.education === "string" ? (
                      // 문자열인 경우 줄바꿈으로 분리하여 표시
                      professorInfo.education.split("\n").map(
                        (edu, index) =>
                          edu.trim() && (
                            <div key={index} className="education-item">
                              <div className="education-degree">
                                {edu.trim()}
                              </div>
                            </div>
                          )
                      )
                    ) : Array.isArray(professorInfo.education) ? (
                      professorInfo.education.map((edu, index) => (
                        <div key={index} className="education-item">
                          <div className="education-degree">
                            {edu.degree ?? "null"}
                          </div>
                          <div className="education-major">
                            {edu.major ?? "null"}
                          </div>
                          <div className="education-institution">
                            {edu.institution ?? "null"}
                          </div>
                        </div>
                      ))
                    ) : typeof professorInfo.education === "object" ? (
                      <div className="education-item">
                        <div className="education-degree">
                          {professorInfo.education.degree ?? "null"}
                        </div>
                        <div className="education-major">
                          {professorInfo.education.major ?? "null"}
                        </div>
                        <div className="education-institution">
                          {professorInfo.education.institution ?? "null"}
                        </div>
                      </div>
                    ) : (
                      <div className="education-item">
                        <div className="education-degree">null</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="detail-section">
                  <span className="detail-section-label">학력</span>
                  <div className="detail-section-content">
                    <div className="education-item">
                      <div className="education-degree">null</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 경력 - API 데이터 사용 */}
              {professorInfo?.career !== null &&
              professorInfo?.career !== undefined ? (
                <div className="detail-section">
                  <span className="detail-section-label">경력</span>
                  <div className="detail-section-content">
                    {typeof professorInfo.career === "string" ? (
                      // 문자열인 경우 줄바꿈으로 분리하여 표시
                      professorInfo.career.split("\n").map(
                        (career, index) =>
                          career.trim() && (
                            <div key={index} className="career-item">
                              <div className="career-period">
                                {career.trim()}
                              </div>
                            </div>
                          )
                      )
                    ) : Array.isArray(professorInfo.career) ? (
                      professorInfo.career.map((career, index) => (
                        <div key={index} className="career-item">
                          <div className="career-period">
                            {career.period ?? "null"}
                          </div>
                          <div className="career-position">
                            {career.position ?? "null"}
                          </div>
                          <div className="career-institution">
                            {career.institution ?? "null"}
                          </div>
                        </div>
                      ))
                    ) : typeof professorInfo.career === "object" ? (
                      <div className="career-item">
                        <div className="career-period">
                          {professorInfo.career.period ?? "null"}
                        </div>
                        <div className="career-position">
                          {professorInfo.career.position ?? "null"}
                        </div>
                        <div className="career-institution">
                          {professorInfo.career.institution ?? "null"}
                        </div>
                      </div>
                    ) : (
                      <div className="career-item">
                        <div className="career-period">null</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="detail-section">
                  <span className="detail-section-label">경력</span>
                  <div className="detail-section-content">
                    <div className="career-item">
                      <div className="career-period">null</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 담당과목 - API 데이터 사용 */}
              {professorInfo?.courses !== null &&
              professorInfo?.courses !== undefined ? (
                <div className="detail-section">
                  <span className="detail-section-label">담당과목</span>
                  <div className="detail-section-content">
                    {typeof professorInfo.courses === "string" ? (
                      // 문자열인 경우 줄바꿈으로 분리하여 표시
                      // "석사 : ..." 형식인지 확인
                      professorInfo.courses.split("\n").map((line, index) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;

                        // "석사 :" 또는 "학사 :" 형식인지 확인
                        if (trimmedLine.includes(":")) {
                          const [courseType, ...courseNames] =
                            trimmedLine.split(":");
                          return (
                            <div key={index}>
                              <div className="course-type">
                                {courseType.trim()}
                              </div>
                              <div className="course-list">
                                {courseNames
                                  .join(":")
                                  .split(",")
                                  .map(
                                    (course, idx) =>
                                      course.trim() && (
                                        <div key={idx} className="course-item">
                                          {course.trim()}
                                        </div>
                                      )
                                  )}
                              </div>
                            </div>
                          );
                        } else {
                          // 단순 줄바꿈으로 구분된 경우
                          return (
                            <div key={index} className="course-item">
                              {trimmedLine}
                            </div>
                          );
                        }
                      })
                    ) : typeof professorInfo.courses === "object" ? (
                      Object.keys(professorInfo.courses).map((courseType) => (
                        <div key={courseType}>
                          <div className="course-type">{courseType}</div>
                          <div className="course-list">
                            {Array.isArray(
                              professorInfo.courses[courseType]
                            ) ? (
                              professorInfo.courses[courseType].map(
                                (course, index) => (
                                  <div key={index} className="course-item">
                                    {course ?? "null"}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="course-item">
                                {professorInfo.courses[courseType] ?? "null"}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="course-type">null</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="detail-section">
                  <span className="detail-section-label">담당과목</span>
                  <div className="detail-section-content">
                    <div className="course-type">null</div>
                  </div>
                </div>
              )}
              {showProfessorScrollIndicator && (
                <div className="scroll-indicator">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="#32C3B0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Chat Container */}
          <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
              <h2 className="chat-header-title">
                AI 교수 - 학생 대화 시뮬레이션
              </h2>
              <button
                className="view-results-button"
                onClick={handleViewResults}
              >
                최종 적합도 분석 결과 보기
              </button>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <p>
                    안녕하세요! {professorName} 교수님과의 채팅을 시작해보세요.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.sender === "user"
                        ? "user-message"
                        : "professor-message"
                    }`}
                  >
                    <div className="message-content">
                      {message.isLoading ? (
                        <div className="loading-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : message.sender === "professor" &&
                        message.formattedText ? (
                        <div className="formatted-message">
                          {message.formattedText
                            .split("\n")
                            .map((line, index) => (
                              <p key={index}>{line}</p>
                            ))}
                        </div>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Question Presets */}
            {messages.length === 0 && (
              <div className="question-presets">
                <div className="presets-label">질문 프리셋</div>
                <div className="presets-list">
                  {questionPresets.map((preset, index) => (
                    <button
                      key={index}
                      className="preset-button"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="메시지를 입력하세요..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button className="send-button" onClick={handleSendMessage}>
                전송
              </button>
            </div>
          </div>

          {/* Right Side Card */}
          <div className="right-info-card">
            <div className="right-card-header">
              <h3 className="right-card-title">대표 논문 목록</h3>
            </div>
            <div className="right-card-content" ref={paperListRef}>
              <div className="paper-list">
                {professor.papers && professor.papers.length > 0 ? (
                  professor.papers.map((yearGroup, yearIndex) =>
                    yearGroup.papers.map((paper, paperIndex) => (
                      <div
                        key={`${yearGroup.year}-${paperIndex}`}
                        className="paper-item"
                      >
                        <div className="paper-title">{paper.title}</div>
                        <div className="paper-info">
                          <span className="paper-journal">{paper.journal}</span>
                          <span className="paper-year">, {yearGroup.year}</span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="no-papers">
                    <p>논문 정보가 없습니다.</p>
                  </div>
                )}
              </div>
              {showScrollIndicator && (
                <div className="scroll-indicator">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="#32C3B0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatSimulation;
