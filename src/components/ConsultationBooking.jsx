import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import "./ConsultationBooking.css";

function ConsultationBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const professor = location.state?.professor;
  const applicantData = location.state?.applicantData;
  const finalResults = location.state?.finalResults;
  const apiResponse = location.state?.apiResponse; // 매칭 결과 API 응답

  // 교수 정보
  const professorName =
    professor?.professor_name || professor?.name || "박현규";
  const professorMajor = professor?.major || "기술경영";
  const professorEmail = professor?.email || "park.hg@sogang.ac.kr"; // Mock email

  // 지원자 정보
  const applicantName = applicantData?.name || "홍길동";

  // 폼 상태
  const [formData, setFormData] = useState({
    date: null,
    time: null,
    consultationMethod: "대면 (교수 연구실)",
    memo: "",
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerRef = useRef(null);

  const [emailPreview, setEmailPreview] = useState({
    subject: `[상담 요청] Advisor.AI 매칭 결과 - ${applicantName}`,
    body: "AI로 메일 초안을 작성하거나, 직접 메모를 입력해주세요.",
  });

  const [consentChecked, setConsentChecked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const abortControllerRef = useRef(null);
  const readerRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 메모가 변경되면 미리보기도 업데이트
    if (field === "memo") {
      setEmailPreview((prev) => ({
        ...prev,
        body: value,
      }));
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}.`;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = date.getHours() < 12 ? "오전" : "오후";
    const displayHours = date.getHours() % 12 || 12;
    return `${period} ${String(displayHours).padStart(2, "0")}:${minutes}`;
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const selectedDate = formData.date;

    // 선택된 날짜가 오늘인지 확인
    const isToday =
      selectedDate &&
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const date = new Date();
        date.setHours(hour, minute, 0, 0);

        // 오늘이고 현재 시간 이전이면 disabled로 표시
        const isDisabled =
          isToday &&
          (hour < currentHour ||
            (hour === currentHour && minute <= currentMinute));

        slots.push({ time: date, disabled: isDisabled });
      }
    }
    return slots;
  }, [formData.date]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target)
      ) {
        setShowTimePicker(false);
      }
    };

    if (showTimePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimePicker]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000); // 3초 후 자동으로 사라짐

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 컴포넌트 언마운트 시 SSE 연결 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (readerRef.current) {
        try {
          readerRef.current.cancel();
        } catch (e) {
          // 이미 해제된 경우 무시
        }
        readerRef.current = null;
      }
    };
  }, []);

  const handleAdvisorAIDraft = async () => {
    // 날짜와 시간 선택 확인
    if (!formData.date || !formData.time) {
      const missingFields = [];
      if (!formData.date) missingFields.push("날짜");
      if (!formData.time) missingFields.push("시간");
      showToastMessage(
        `다음 항목을 모두 선택해주세요: ${missingFields.join(", ")}`
      );
      return;
    }

    // 기존 연결이 있으면 종료
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      try {
        readerRef.current.cancel();
      } catch (e) {
        // 이미 해제된 경우 무시
      }
      readerRef.current = null;
    }

    // API Base URL
    const API_BASE_URL = "https://api.advisor-ai.net";

    setIsLoadingDraft(true);

    // 초기 상태로 초기화
    setFormData((prev) => ({
      ...prev,
      memo: "",
    }));
    setEmailPreview((prev) => ({
      ...prev,
      body: "",
    }));

    try {
      // 날짜 형식 변환 (YYYY-MM-DD)
      const selectedDate = formData.date;
      const formattedDate = selectedDate.toISOString().split("T")[0];

      // 시간 형식 변환 (HH:mm)
      const timeString = formData.time
        ? `${String(formData.time.getHours()).padStart(2, "0")}:${String(
            formData.time.getMinutes()
          ).padStart(2, "0")}`
        : "";

      // API 요청 본문 구성
      const requestBody = {
        applicant_id:
          apiResponse?.applicant_id || finalResults?.applicant_id || 0,
        professor_id: professor?.professor_id || "",
        session_id: finalResults?.session_id || 0,
        appointment_date: formattedDate,
        appointment_time: timeString,
        consultation_method: formData.consultationMethod,
      };

      console.log("이메일 초안 요청 본문:", requestBody);

      // AbortController 생성
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // SSE API 호출
      const response = await fetch(`${API_BASE_URL}/email/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      // ReadableStream으로 SSE 데이터 읽기
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";
      let firstTokenReceived = false;

      const readStream = async () => {
        try {
          while (true) {
            // AbortController로 취소되었는지 확인
            if (abortController.signal.aborted) {
              console.log("SSE 스트림 취소됨");
              break;
            }

            const { done, value } = await reader.read();

            if (done) {
              console.log("SSE 스트림 종료");
              break;
            }

            // 청크를 디코딩하고 버퍼에 추가
            buffer += decoder.decode(value, { stream: true });

            // SSE 형식 파싱 (data: 로 시작하는 라인)
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // 마지막 불완전한 라인은 버퍼에 보관

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6); // "data: " 제거

                try {
                  // JSON 파싱
                  const parsed = JSON.parse(data);

                  // done이 true이면 스트림 종료
                  if (parsed.done === true) {
                    console.log("SSE 스트림 완료");
                    break;
                  }

                  // content 필드에서 텍스트 가져오기
                  const content = parsed.content || "";

                  if (content) {
                    // 첫 토큰이 오면 로딩 종료
                    if (!firstTokenReceived) {
                      firstTokenReceived = true;
                      setIsLoadingDraft(false);
                    }

                    // 토큰이 올 때마다 바로바로 추가하여 업데이트
                    setFormData((prev) => ({
                      ...prev,
                      memo: (prev.memo || "") + content,
                    }));
                    setEmailPreview((prev) => ({
                      ...prev,
                      body: (prev.body || "") + content,
                    }));
                  }
                } catch (e) {
                  console.error("SSE 데이터 파싱 오류:", e, "데이터:", data);
                }
              }
            }
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("SSE 스트림이 취소되었습니다");
          } else {
            console.error("SSE 스트림 읽기 오류:", error);
            showToastMessage(
              "이메일 초안 작성 중 오류가 발생했습니다. 다시 시도해주세요."
            );
          }
        } finally {
          try {
            reader.releaseLock();
          } catch (e) {
            // 이미 해제된 경우 무시
          }
          readerRef.current = null;
          abortControllerRef.current = null;
          setIsLoadingDraft(false);

          // 스트림이 완료되면 완료 메시지 표시
          setFormData((prev) => {
            if (prev.memo) {
              showToastMessage("메일 초안 작성이 완료되었습니다.");
            }
            return prev;
          });
        }
      };

      readStream();
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("이메일 초안 요청이 취소되었습니다");
      } else {
        console.error("이메일 초안 작성 API 오류:", error);
        showToastMessage(
          "이메일 초안 작성 중 오류가 발생했습니다. 다시 시도해주세요."
        );
      }
      setIsLoadingDraft(false);
    }
  };

  const handleSendEmail = () => {
    if (!consentChecked) {
      showToastMessage("개인정보 및 메일 발송 동의를 체크해주세요.");
      return;
    }

    // TODO: 실제 메일 발송 API 연동
    setShowSuccessModal(true);
  };

  const handleGoToMain = () => {
    navigate("/");
  };

  const consultationMethods = [
    "대면 (교수 연구실)",
    "대면 (기타 장소)",
    "비대면 (화상회의)",
    "전화",
  ];

  return (
    <div className="consultation-booking-page">
      <div className="consultation-booking-container">
        <div className="page-header">
          <h1 className="page-title">Step 5 - 상담 예약 및 메일 발송</h1>
        </div>

        <div className="booking-layout">
          {/* Left Section: 상담 예약 폼 */}
          <div className="booking-form-card">
            <div className="card-header-section">
              <h2 className="card-title">상담 예약 폼</h2>
              <div className="card-header-divider"></div>
            </div>

            <div className="form-field">
              <label className="field-label">지도교수</label>
              <input
                type="text"
                className="text-input"
                value={`${professorName} 교수 (${professorMajor})`}
                readOnly
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="field-label">날짜</label>
                <div style={{ position: "relative" }}>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => {
                      handleInputChange("date", date);
                      // 날짜가 변경되면 시간도 초기화 (새로운 날짜에 맞는 시간만 선택 가능하도록)
                      if (date) {
                        handleInputChange("time", null);
                      }
                    }}
                    dateFormat="yyyy. MM. dd."
                    placeholderText="연도. 월. 일."
                    locale={ko}
                    className="text-input date-picker-input"
                    calendarClassName="custom-calendar"
                    showPopperArrow={false}
                    todayButton="오늘"
                    minDate={new Date()}
                    popperPlacement="bottom-start"
                    popperContainer={({ children }) => children}
                    popperModifiers={[
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8],
                        },
                      },
                      {
                        name: "preventOverflow",
                        enabled: false,
                      },
                      {
                        name: "flip",
                        enabled: false,
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">시간</label>
                <div style={{ position: "relative" }} ref={timePickerRef}>
                  <div
                    className="text-input time-picker-input"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    {formData.time ? formatTime(formData.time) : "--:--"}
                    <span
                      className="input-icon"
                      style={{
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      🕐
                    </span>
                  </div>
                  {showTimePicker && (
                    <div className="time-picker-dropdown">
                      <div className="time-picker-list">
                        {timeSlots.map((slot, index) => (
                          <div
                            key={index}
                            className={`time-slot ${
                              formData.time &&
                              formData.time.getTime() === slot.time.getTime()
                                ? "selected"
                                : ""
                            } ${slot.disabled ? "disabled" : ""}`}
                            onClick={() => {
                              if (!slot.disabled) {
                                handleInputChange("time", slot.time);
                                setShowTimePicker(false);
                              }
                            }}
                          >
                            {formatTime(slot.time)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">상담 방식</label>
              <select
                className="select-input"
                value={formData.consultationMethod}
                onChange={(e) =>
                  handleInputChange("consultationMethod", e.target.value)
                }
              >
                {consultationMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field memo-field">
              <label className="field-label">메모 입력 (메일 본문)</label>
              <div className="textarea-wrapper">
                {isLoadingDraft && (
                  <div className="memo-loading-overlay">
                    <div className="memo-loading-spinner"></div>
                    <span className="memo-loading-text">
                      메일 초안 작성 중...
                    </span>
                  </div>
                )}
                <textarea
                  className="textarea-input"
                  placeholder="메일 본문을 입력하세요..."
                  value={formData.memo}
                  onChange={(e) => handleInputChange("memo", e.target.value)}
                  disabled={isLoadingDraft}
                />
              </div>
            </div>

            <button className="advisor-button" onClick={handleAdvisorAIDraft}>
              <span className="advisor-icon">✨</span>
              <span>Advisor AI로 메일 초안 작성하기</span>
            </button>
          </div>

          {/* Right Section: 메일 미리보기 */}
          <div className="email-preview-card">
            <div className="card-header-section">
              <h2 className="card-title">메일 미리보기</h2>
              <div className="card-header-divider"></div>
            </div>

            <div className="preview-info">
              <div className="preview-item">
                <span className="preview-label">받는 사람:</span>
                <span className="preview-value">{professorEmail}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">제목:</span>
                <span className="preview-value">{emailPreview.subject}</span>
              </div>
            </div>

            <div className="email-body-preview">
              <div className="email-body-content">
                {emailPreview.body ||
                  "AI로 메일 초안을 작성하거나, 직접 메모를 입력해주세요."}
              </div>
            </div>

            <div className="consent-checkbox">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <label htmlFor="consent">개인정보 및 메일 발송 동의</label>
            </div>

            <button className="send-email-button" onClick={handleSendEmail}>
              <span className="email-icon">✉️</span>
              <span>메일 보내기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-message">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleGoToMain}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✓</div>
            <h2 className="modal-title">메일 발송 완료</h2>
            <p className="modal-message">메일이 성공적으로 발송되었습니다.</p>
            <button className="modal-button" onClick={handleGoToMain}>
              메인 화면으로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsultationBooking;
