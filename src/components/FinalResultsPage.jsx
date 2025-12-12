import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./FinalResultsPage.css";

function FinalResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const professor = location.state?.professor;
  const applicantData = location.state?.applicantData;
  const sessionId = location.state?.sessionId;
  const finalResultsFromState = location.state?.finalResults; // 메타데이터
  const initialReportContent = location.state?.reportContent || "";
  const isStreaming = location.state?.isStreaming || false;
  const apiResponse = location.state?.apiResponse; // 매칭 결과 API 응답

  // 리포트 스트리밍 상태
  const [reportContent, setReportContent] = useState(() => {
    if (initialReportContent) {
      return initialReportContent;
    }
    // 전역 변수에 내용이 있으면 사용
    if (window.finalResultsContent) {
      return window.finalResultsContent;
    }
    return "";
  });
  const [finalScore, setFinalScore] = useState(() => {
    // finalResultsFromState에서 final_score를 우선 사용
    if (
      finalResultsFromState?.final_score !== undefined &&
      finalResultsFromState?.final_score !== null
    ) {
      return finalResultsFromState.final_score;
    }
    return null;
  });
  const [isLoadingReport, setIsLoadingReport] = useState(
    !initialReportContent &&
      !window.finalResultsContent &&
      !!sessionId &&
      isStreaming
  );
  const abortControllerRef = useRef(null);
  const readerRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // API 응답에서 교수님 정보 가져오기
  const professorName =
    finalResultsFromState?.professor_name ||
    professor?.professor_name ||
    professor?.name ||
    "박현규";
  const professorMajor = professor?.major || "기술경영";
  const researchAreas =
    professor?.researchAreas?.join("·") || "기술혁신·디지털전환";

  // 스트리밍 모드일 때 즉시 setter 등록 (렌더링 전에)
  if (isStreaming && sessionId) {
    window.finalResultsSetContent = (updater) => {
      setReportContent((prev) => {
        const newContent =
          typeof updater === "function" ? updater(prev) : updater;
        return newContent;
      });
    };
  }

  // SSE로 리포트 스트리밍 받기
  useEffect(() => {
    // 이미 초기화되었으면 다시 실행하지 않음
    if (hasInitializedRef.current) {
      return;
    }

    // 스트리밍 모드일 때
    if (isStreaming && sessionId) {
      hasInitializedRef.current = true;

      // 첫 토큰은 이미 받았으므로 로딩 종료
      setIsLoadingReport(false);

      // window를 통해 setReportContent 등록 (이미 등록되어 있을 수 있음)
      window.finalResultsSetContent = (updater) => {
        setReportContent((prev) => {
          const newContent =
            typeof updater === "function" ? updater(prev) : updater;
          return newContent;
        });
      };

      // initialReportContent가 없고 전역 변수에 내용이 있으면 표시
      // (새로운 요청이면 전역 변수는 비어있을 것)
      if (!initialReportContent && window.finalResultsContent) {
        console.log(
          "FinalResultsPage - 전역 변수에서 내용 읽기:",
          window.finalResultsContent.length
        );
        setReportContent(window.finalResultsContent);
      } else if (initialReportContent) {
        // initialReportContent가 있으면 그것을 사용 (새로운 요청)
        setReportContent(initialReportContent);
      }

      // 주기적으로 전역 변수를 체크하여 업데이트
      const intervalId = setInterval(() => {
        if (window.finalResultsContent) {
          setReportContent((prev) => {
            const globalLength = window.finalResultsContent.length;
            if (globalLength > prev.length) {
              console.log(
                "FinalResultsPage - 전역 변수 업데이트:",
                globalLength
              );
              return window.finalResultsContent;
            }
            return prev;
          });
        }
      }, 50); // 50ms마다 체크

      // cleanup에서 제거
      return () => {
        clearInterval(intervalId);
        delete window.finalResultsSetContent;
      };
    }

    // 스트리밍이 아니거나 sessionId가 없으면 초기화 완료
    hasInitializedRef.current = true;
  }, [sessionId, isStreaming, initialReportContent]);

  const handleReSearch = () => {
    navigate("/results", {
      state: {
        professor: professor,
        applicantData: applicantData,
      },
    });
  };

  const handleConfirmMatch = () => {
    navigate("/consultation-booking", {
      state: {
        professor: professor,
        applicantData: applicantData,
        finalResults: finalResultsFromState
          ? {
              ...finalResultsFromState,
              report: reportContent,
              final_score: finalScore,
            }
          : undefined,
        apiResponse: location.state?.apiResponse, // 매칭 결과 API 응답도 전달
      },
    });
    console.log("매칭 확정 및 상담 예약 페이지로 이동 예정");
  };

  return (
    <div className="final-results-page">
      <div className="final-results-container">
        {/* Header */}
        <div className="final-results-header">
          <h1 className="final-results-title">Step 4 - 최종 매칭 결과</h1>
          <p className="final-results-description">
            AI Twin과의 대화 시뮬레이션을 바탕으로 분석된 최종 적합도
            리포트입니다.
          </p>
        </div>

        {/* Main Card */}
        <div className="final-results-card">
          {/* Card Header */}
          <div className="card-header">
            <div className="card-header-left">
              <h2 className="card-title">
                최종 매칭 분석: {professorName} 교수
              </h2>
              <p className="card-subtitle">
                {professorMajor} / {researchAreas}
              </p>
            </div>
            <div className="card-header-right">
              <div className="initial-score-value">
                {finalScore !== null ? `${finalScore}%` : "-"}
              </div>
              <div className="initial-score-label">최종 매칭률</div>
            </div>
          </div>

          {/* Card Content */}
          <div className="card-content">
            <div className="report-content">
              {isLoadingReport ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: "40px",
                      height: "40px",
                      border: "4px solid #e5e7eb",
                      borderTopColor: "#32c3b0",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <p style={{ marginTop: "1rem", color: "#6b7280" }}>
                    리포트를 생성하는 중...
                  </p>
                </div>
              ) : reportContent ? (
                <ReactMarkdown>{reportContent}</ReactMarkdown>
              ) : (
                <p>리포트 데이터가 없습니다.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card-actions">
            <button
              className="action-button re-search-button"
              onClick={handleReSearch}
            >
              <div className="button-icon re-search-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4V10H7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23 20V14H17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>다른 교수님 재탐색</span>
            </button>
            <button
              className="action-button confirm-button"
              onClick={handleConfirmMatch}
            >
              <div className="button-icon confirm-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>매칭 확정 및 상담 예약</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalResultsPage;
