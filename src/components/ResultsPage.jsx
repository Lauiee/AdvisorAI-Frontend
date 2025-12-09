import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import "./ResultsPage.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 목 데이터
const mockApplicantData = {
  name: "홍길동",
  major: "기술경영",
  keyword: "기술전략",
  learningStyles: ["탐구형", "협업형"],
};

const mockProfessors = [
  {
    professor_id: "prof_001",
    professor_name: "박현규",
    major: "기술경영",
    researchAreas: ["조직학습", "정성연구", "기술혁신"],
    total_score: 83,
    matchingRate: 83, // total_score와 동일하게 유지 (기존 코드 호환성)
    isSelected: true,
    breakdown: {
      A: 71, // 연구 키워드
      B: 86, // 연구 방법론
      C: 85, // 커뮤니케이션
      D: 85, // 학문 접근도
      E: 87, // 교수 선호도
    },
    indicator_scores: [
      {
        indicator: "A. 연구 키워드 (Research Keyword)",
        score: 71,
      },
      {
        indicator: "B. 연구 방법론 (Research Methodology)",
        score: 86,
      },
      {
        indicator: "C. 커뮤니케이션 (Communication)",
        score: 85,
      },
      {
        indicator: "D. 학문 접근도 (Academic Approach)",
        score: 85,
      },
      {
        indicator: "E. 교수 선호도 (Preferred Student Type)",
        score: 87,
      },
    ],
    rationale:
      "홍길동 학생과 박현규 교수의 매칭은 매우 적합한 것으로 평가됩니다. 홍 학생의 관심 키워드인 디지털 전환은 박 교수의 연구 분야인 디지털 기업가 정신과 밀접하게 연결되어 있어, 두 사람 간의 연구 방향성이 일치합니다. 또한, 홍 학생의 사례 기반, 협업형, 탐구형 학습 성향은 박 교수의 정성연구방법론과 전략기획도구 활용에 적합하며, 이로 인해 시너지 효과가 기대됩니다. 특히, 교수 선호도 87점이라는 높은 점수는 교수님이 홍 학생과의 협업을 긍정적으로 바라보고 있음을 보여주며, 이는 향후 연구 프로젝트에서의 긴밀한 협력 가능성을 더욱 높입니다.",
    papers: [
      {
        year: 2025,
        papers: [
          {
            title:
              "Cost-Effectively Leveraging Digital Capital to Develop Means for Effectual Decision-Making.",
            journal: "Strategic Entrepreneurship Journal",
          },
          {
            title:
              "Cost-Effectively Leveraging Digital Capital to Develop Means for Effectual Decision-Making.",
            journal: "Strategic Entrepreneurship Journal",
          },
        ],
      },
      {
        year: 2021,
        papers: [
          {
            title:
              "Bottom-Up Solutions in a Time of Crisis: The Case of Covid-19 in South Korea.",
            journal: "R&D Management Journal",
          },
          {
            title:
              "Discovering and Managing Interdependence with Customer–Entrepreneurs.",
            journal: "British Journal of Management",
          },
          {
            title:
              "Customer Entrepreneurship on Digital Platforms: Challenges and Solutions for Platform Business Models.",
            journal: "Creativity and Innovation Management",
          },
        ],
      },
      {
        year: 2020,
        papers: [
          {
            title:
              "20 Years of Technology and Strategic Roadmapping Research: A school of thought perspective.",
            journal: "Technological Forecasting and Social Change",
          },
        ],
      },
    ],
    career: {
      학력: [
        {
          degree: "Ph.D.",
          major: "Technology and Innovation Management",
          institution: "University of Cambridge",
        },
        {
          degree: "M.A.",
          major: "MEng in Human Computer Interaction",
          institution: "Seoul National University",
        },
        {
          degree: "B.A.",
          major: "Anthropology (Ethnographic Studies)",
          institution: "Chung-Ang University",
        },
      ],
      경력: [
        {
          period: "2021.03 ~ 현재",
          position: "교수",
          institution: "서강대학교 기술경영전문대학원",
        },
        {
          period: "2020.09 ~ 2021.02",
          position: "교수",
          institution: "서섹스대학교 경영대학",
        },
        {
          period: "2018.05 ~ 2020.08",
          position: "연구교수",
          institution: "캠브리지대학교 공과대학",
        },
        {
          period: "2012.06 ~ 2014.06",
          position: "선임연구원",
          institution: "LG CNS",
        },
      ],
    },
    courses: {
      석사: ["기술혁신론", "기술로드매핑 이론과 실습", "정성연구와 사례개발"],
    },
  },
  {
    professor_id: "prof_002",
    professor_name: "우한균",
    major: "경영정보시스템",
    researchAreas: ["AI Adoption", "디지털전환"],
    total_score: 87,
    matchingRate: 87,
    isSelected: false,
    breakdown: {
      A: 82,
      B: 88,
      C: 85,
      D: 88,
      E: 90,
    },
    indicator_scores: [
      {
        indicator: "A. 연구 키워드 (Research Keyword)",
        score: 82,
      },
      {
        indicator: "B. 연구 방법론 (Research Methodology)",
        score: 88,
      },
      {
        indicator: "C. 커뮤니케이션 (Communication)",
        score: 85,
      },
      {
        indicator: "D. 학문 접근도 (Academic Approach)",
        score: 88,
      },
      {
        indicator: "E. 교수 선호도 (Preferred Student Type)",
        score: 90,
      },
    ],
    rationale:
      "우한균 교수와의 매칭은 AI 및 디지털 전환 분야에서 높은 적합도를 보입니다.",
  },
  {
    professor_id: "prof_003",
    professor_name: "박진혁",
    major: "기술경제학",
    researchAreas: ["R&D 전략", "특허데이터"],
    total_score: 85,
    matchingRate: 85,
    isSelected: false,
    breakdown: {
      A: 80,
      B: 85,
      C: 82,
      D: 88,
      E: 85,
    },
    indicator_scores: [
      {
        indicator: "A. 연구 키워드 (Research Keyword)",
        score: 80,
      },
      {
        indicator: "B. 연구 방법론 (Research Methodology)",
        score: 85,
      },
      {
        indicator: "C. 커뮤니케이션 (Communication)",
        score: 82,
      },
      {
        indicator: "D. 학문 접근도 (Academic Approach)",
        score: 88,
      },
      {
        indicator: "E. 교수 선호도 (Preferred Student Type)",
        score: 85,
      },
    ],
    rationale:
      "박진혁 교수는 R&D 전략과 특허 데이터 분석에 특화되어 있어 기술 전략 연구에 적합합니다.",
  },
  {
    professor_id: "prof_004",
    professor_name: "문성욱",
    major: "전략경영",
    researchAreas: ["데이터경제", "혁신전략"],
    total_score: 81,
    matchingRate: 81,
    isSelected: false,
    breakdown: {
      A: 78,
      B: 82,
      C: 80,
      D: 83,
      E: 82,
    },
    indicator_scores: [
      {
        indicator: "A. 연구 키워드 (Research Keyword)",
        score: 78,
      },
      {
        indicator: "B. 연구 방법론 (Research Methodology)",
        score: 82,
      },
      {
        indicator: "C. 커뮤니케이션 (Communication)",
        score: 80,
      },
      {
        indicator: "D. 학문 접근도 (Academic Approach)",
        score: 83,
      },
      {
        indicator: "E. 교수 선호도 (Preferred Student Type)",
        score: 82,
      },
    ],
    rationale:
      "문성욱 교수는 데이터 경제와 혁신 전략 분야에서 강점을 보입니다.",
  },
  {
    professor_id: "prof_005",
    professor_name: "김문환",
    major: "기술경영",
    researchAreas: ["기술전략", "혁신경영"],
    total_score: 78,
    matchingRate: 78,
    isSelected: false,
    breakdown: {
      A: 75,
      B: 80,
      C: 78,
      D: 79,
      E: 78,
    },
    indicator_scores: [
      {
        indicator: "A. 연구 키워드 (Research Keyword)",
        score: 75,
      },
      {
        indicator: "B. 연구 방법론 (Research Methodology)",
        score: 80,
      },
      {
        indicator: "C. 커뮤니케이션 (Communication)",
        score: 78,
      },
      {
        indicator: "D. 학문 접근도 (Academic Approach)",
        score: 79,
      },
      {
        indicator: "E. 교수 선호도 (Preferred Student Type)",
        score: 78,
      },
    ],
    rationale:
      "김문환 교수는 기술 전략과 혁신 경영 분야에서 연구를 진행하고 있습니다.",
  },
];

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // location.state에서 전달받은 데이터 사용 (없으면 목 데이터)
  const applicantData = location.state?.applicantData || mockApplicantData;
  const professors = location.state?.professors || mockProfessors;
  const selectedSchool = location.state?.school || "기술경영전문대학원(MOT)";

  const [selectedProfessor, setSelectedProfessor] = useState(
    professors.find((p) => p.isSelected) || professors[0]
  );

  // 레이더 차트용 데이터 준비 (5개 지표)
  const getChartData = (professor) => {
    if (!professor || !professor.breakdown) {
      return {
        labels: [
          "연구 키워드",
          "연구 방법론",
          "커뮤니케이션",
          "학문 접근도",
          "교수 선호도",
        ],
        values: [0, 0, 0, 0, 0],
      };
    }
    return {
      labels: [
        "연구 키워드",
        "연구 방법론",
        "커뮤니케이션",
        "학문 접근도",
        "교수 선호도",
      ],
      values: [
        professor.breakdown.A || 0,
        professor.breakdown.B || 0,
        professor.breakdown.C || 0,
        professor.breakdown.D || 0,
        professor.breakdown.E || 0,
      ],
    };
  };

  const chartData = getChartData(selectedProfessor);

  // Chart.js용 데이터 형식으로 변환
  const radarChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "매칭 점수",
        data: chartData.values,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const chart = context.chart;
          const { chartArea } = chart;
          if (!chartArea) {
            return "rgba(239, 68, 68, 0.2)";
          }
          const gradient = ctx.createLinearGradient(
            chartArea.left,
            chartArea.top,
            chartArea.right,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.25)");
          gradient.addColorStop(0.5, "rgba(239, 68, 68, 0.15)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.25)");
          return gradient;
        },
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
        pointHoverBackgroundColor: "rgba(239, 68, 68, 1)",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          font: {
            size: 11,
            weight: "500",
          },
          color: "#9ca3af",
          backdropColor: "transparent",
          z: 1,
        },
        pointLabels: {
          font: {
            size: 13,
            weight: "600",
            family: "'Inter', 'Noto Sans KR', sans-serif",
          },
          color: "#1e2a3a",
          padding: 12,
        },
        grid: {
          color: (context) => {
            if (context.tick.value === 0) {
              return "#d1d5db";
            }
            return "#e5e7eb";
          },
          lineWidth: (context) => {
            if (context.tick.value === 0) {
              return 2;
            }
            return context.tick.value % 20 === 0 ? 1 : 0.5;
          },
        },
        angleLines: {
          color: "#e5e7eb",
          lineWidth: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(30, 42, 58, 0.95)",
        padding: 12,
        titleFont: {
          size: 13,
          weight: "600",
        },
        bodyFont: {
          size: 12,
          weight: "500",
        },
        borderColor: "rgba(239, 68, 68, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `매칭 점수: ${context.parsed.r}%`;
          },
        },
      },
    },
  };

  const handleProfessorClick = (professor) => {
    setSelectedProfessor(professor);
  };

  const handlePreviousStep = () => {
    navigate("/applicant-form", {
      state: { school: selectedSchool, formData: location.state?.formData },
    });
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleChatSimulation = () => {
    navigate("/chat-simulation", {
      state: {
        professor: selectedProfessor,
        applicantData: applicantData,
      },
    });
  };

  return (
    <div className="results-page">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <h1 className="results-title">Step 2 - AI 매칭 결과</h1>
        </div>

        {/* Main Content */}
        <div className="results-content">
          {/* Left Panel - Applicant Profile */}
          <div className="applicant-profile-panel">
            <div className="profile-header">
              <h2 className="panel-title">지원자 프로필</h2>
            </div>
            <div className="profile-content">
              <div className="profile-item">
                <div className="profile-item-content">
                  <span className="profile-label">이름</span>
                  <span className="profile-value">{applicantData.name}</span>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-item-content">
                  <span className="profile-label">전공</span>
                  <span className="profile-value">{applicantData.major}</span>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-item-content">
                  <span className="profile-label">키워드</span>
                  <span className="profile-value">{applicantData.keyword}</span>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-item-content">
                  <span className="profile-label">성향</span>
                  <span className="profile-value">
                    {Array.isArray(applicantData.learningStyles)
                      ? applicantData.learningStyles.join(", ")
                      : applicantData.learningStyle || "없음"}
                  </span>
                </div>
              </div>
            </div>
            <div className="profile-actions">
              <button
                className="nav-button prev-button"
                onClick={handlePreviousStep}
              >
                ← 이전 단계
              </button>
              <button className="nav-button home-button" onClick={handleGoHome}>
                처음으로
              </button>
            </div>
          </div>

          {/* Center Panel - Professor Details (Graph will be added later) */}
          <div className="professor-details-panel">
            <div className="professor-header">
              <div className="professor-info">
                <h2 className="professor-name">
                  {selectedProfessor.professor_name || selectedProfessor.name}{" "}
                  교수님
                </h2>
                <p className="professor-major">{selectedProfessor.major}</p>
              </div>
              <div className="matching-rate-section">
                <div className="matching-rate-value">
                  {selectedProfessor.total_score ||
                    selectedProfessor.matchingRate}
                  %
                </div>
                <div className="matching-rate-label">
                  매칭률 (Top{" "}
                  {professors.findIndex(
                    (p) =>
                      (p.professor_id || p.id) ===
                      (selectedProfessor.professor_id || selectedProfessor.id)
                  ) + 1}
                  )
                </div>
              </div>
            </div>
            <div className="radar-chart-container">
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>
            {selectedProfessor.rationale && (
              <div className="rationale-section">
                <h3 className="rationale-title">해석 요약</h3>
                <p className="rationale-content">
                  {selectedProfessor.rationale}
                </p>
                <button
                  className="simulation-button"
                  onClick={handleChatSimulation}
                >
                  <span>Advisor.AI 채팅 시뮬레이션</span>
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Professor List */}
          <div className="professor-list-panel">
            <h2 className="panel-title">교수진 목록</h2>
            <div className="professor-list">
              {professors.map((professor) => {
                const professorId = professor.professor_id || professor.id;
                const professorName =
                  professor.professor_name || professor.name;
                const matchingRate =
                  professor.total_score || professor.matchingRate;
                const isSelected =
                  (selectedProfessor.professor_id || selectedProfessor.id) ===
                  professorId;

                return (
                  <div
                    key={professorId}
                    className={`professor-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleProfessorClick(professor)}
                  >
                    <div className="professor-card-header">
                      <span className="professor-card-name">
                        {professorName} 교수
                      </span>
                      <span className="matching-badge">{matchingRate}%</span>
                    </div>
                    <div className="professor-card-content">
                      <span className="professor-card-major">
                        {professor.major}
                      </span>
                      <span className="professor-card-divider">/</span>
                      <span className="professor-card-areas">
                        {professor.researchAreas.join("·")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
