import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ChatSimulation.css";

function ChatSimulation() {
  const navigate = useNavigate();
  const location = useLocation();
  const professor = location.state?.professor;
  const applicantData = location.state?.applicantData;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showProfessorScrollIndicator, setShowProfessorScrollIndicator] =
    useState(false);
  const paperListRef = useRef(null);
  const professorCardRef = useRef(null);

  const handleGoBack = () => {
    navigate("/results", {
      state: {
        professor: professor,
        applicantData: applicantData,
      },
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // TODO: 실제 채팅 API 연동
    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // TODO: 교수님 응답 시뮬레이션
    setTimeout(() => {
      const professorResponse = {
        id: Date.now() + 1,
        text: "안녕하세요. 연구에 대해 더 자세히 이야기해볼까요?",
        sender: "professor",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, professorResponse]);
    }, 1000);
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

  const professorName = professor.professor_name || professor.name;

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
              <p className="professor-card-major">{professor.major}</p>
            </div>
            <div className="professor-card-details" ref={professorCardRef}>
              <div className="detail-item">
                <span className="detail-label">매칭률</span>
                <span className="detail-value">
                  {professor.total_score || professor.matchingRate}%
                </span>
              </div>
              {professor.researchAreas && (
                <div className="detail-item">
                  <span className="detail-label">연구 분야</span>
                  <span className="detail-value">
                    {professor.researchAreas.join(", ")}
                  </span>
                </div>
              )}

              {/* 학력 */}
              {professor.career && professor.career.학력 && (
                <div className="detail-section">
                  <span className="detail-section-label">학력</span>
                  <div className="detail-section-content">
                    {professor.career.학력.map((edu, index) => (
                      <div key={index} className="education-item">
                        <div className="education-degree">{edu.degree}</div>
                        <div className="education-major">{edu.major}</div>
                        <div className="education-institution">
                          {edu.institution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 경력 */}
              {professor.career && professor.career.경력 && (
                <div className="detail-section">
                  <span className="detail-section-label">경력</span>
                  <div className="detail-section-content">
                    {professor.career.경력.map((career, index) => (
                      <div key={index} className="career-item">
                        <div className="career-period">{career.period}</div>
                        <div className="career-position">{career.position}</div>
                        <div className="career-institution">
                          {career.institution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 담당과목 */}
              {professor.courses && professor.courses.석사 && (
                <div className="detail-section">
                  <span className="detail-section-label">담당과목</span>
                  <div className="detail-section-content">
                    <div className="course-type">석사</div>
                    <div className="course-list">
                      {professor.courses.석사.map((course, index) => (
                        <div key={index} className="course-item">
                          {course}
                        </div>
                      ))}
                    </div>
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
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

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
