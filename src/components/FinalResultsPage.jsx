import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./FinalResultsPage.css";

function FinalResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const professor = location.state?.professor;
  const applicantData = location.state?.applicantData;

  // Mock API response data
  const mockFinalResults = {
    session_id: 1,
    applicant_id: 1,
    professor_id: professor?.professor_id || "prof_001",
    professor_name: professor?.professor_name || professor?.name || "박현규",
    initial_score: professor?.total_score || professor?.matchingRate || 80,
    chat_score: 0,
    final_score: 80,
    report:
      "### 최종 매칭 리포트\n\n#### 요약\n본 리포트는 지원자 테스터와 박현규 교수의 매칭 적합도를 분석한 결과를 종합적으로 정리한 것입니다. 1차 적합도 분석에서 전체 적합도는 80점으로 평가되었으며, 채팅 기반 분석에서는 적합도가 0점으로 나타났습니다. 이러한 정보를 바탕으로 강점 및 개선점, 최종 추천 사항을 제시합니다.\n\n#### 상세 분석\n1. **1차 적합도 분석**\n   - **전체 적합도 (80점)**: 지원자는 박현규 교수와의 연구 주제 및 방법론에서 높은 적합성을 보였습니다.\n   - **연구 키워드 (74점)**: 기술 전략에 대한 관심이 있지만, 교수님의 연구 주제와의 부분적 괴리가 존재할 수 있습니다.\n   - **연구 방법론 (86점)**: 사례 기반 학습 성향은 교수님의 연구 방법론과 잘 맞아떨어져, 실질적인 연구 경험을 쌓을 수 있는 기회를 제공합니다.\n   - **커뮤니케이션 (84점)**: 지원자의 커뮤니케이션 능력은 교수님과의 협업에 긍정적인 영향을 미칠 것으로 예상됩니다.\n   - **학문 접근도 (77점)**: 지원자가 교수님의 접근 방식을 이해하고 적용할 수 있는 가능성이 있지만, 더 깊은 이해가 필요할 수 있습니다.\n   - **교수 선호도 (80점)**: 교수님이 지원자를 긍정적으로 평가할 가능성이 높습니다.\n\n2. **채팅 기반 분석**\n   - **채팅 적합도 (0점)**: 채팅 내역이 없음을 감안할 때, 지원자와 교수님 간의 초기 소통이 부족하다는 점은 큰 개선 요소로 작용할 수 있습니다.\n\n#### 결론\n테스터와 박현규 교수의 매칭은 전반적으로 긍정적인 평가를 받았습니다. 그러나 채팅 기반의 소통이 전혀 이루어지지 않은 점은 반드시 개선해야 할 부분입니다. 지원자는 교수님과의 초기 소통을 통해 연구 주제와 방향성을 더욱 명확히 하는 것이 필요합니다.\n\n**추천 사항:**\n1. 지원자는 박현규 교수와의 간단한 소통을 통해 연구 관심사 및 방법론에 대한 논의를 시작해야 합니다.\n2. 기술 전략 분야에 대한 구체적인 사례 자료를 준비하여 교수님과의 대화에서 활용할 것을 권장합니다.\n3. 교수님의 연구 주제에 대한 사전 조사 후, 지원자의 학문 접근 방식을 교수님과 비교하여 보다 심도 있는 논의를 하는 것이 필요합니다.\n\n이러한 조치를 통해 지원자가 박현규 교수와의 연구에서 더 큰 시너지를 창출할 수 있을 것으로 기대됩니다.",
    chat_analysis: "채팅 내역이 없습니다.",
    success: true,
  };

  const finalResults = location.state?.finalResults || mockFinalResults;
  const professorName = finalResults.professor_name;
  const professorMajor = professor?.major || "기술경영";
  const researchAreas =
    professor?.researchAreas?.join("·") || "기술혁신·디지털전환";

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
        finalResults: finalResults,
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
                {finalResults.initial_score}%
              </div>
              <div className="initial-score-label">최종 매칭률</div>
            </div>
          </div>

          {/* Card Content */}
          <div className="card-content">
            <div className="report-content">
              <ReactMarkdown>{finalResults.report}</ReactMarkdown>
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
