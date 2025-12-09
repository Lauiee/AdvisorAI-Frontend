import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "./MainPage.css";

const graduateSchools = [
  {
    name: "경영전문대학원",
    icon: "💼",
    majors: ["MBA", "경영전략"],
    tags: ["조직", "혁신", "리더십"],
  },
  {
    name: "공학대학원",
    icon: "⚙️",
    majors: ["컴퓨터공학", "산업공학"],
    tags: ["데이터", "AI", "시스템"],
  },
  {
    name: "기술경영전문대학원(MOT)",
    icon: "🚀",
    majors: ["기술경영", "기술혁신"],
    tags: ["기술전략", "AI전환", "창업"],
  },
  {
    name: "사회과학대학원",
    icon: "📊",
    majors: ["경제학", "정치외교"],
    tags: ["정책", "사회분석"],
  },
  {
    name: "법학전문대학원",
    icon: "⚖️",
    majors: ["법학", "기업법"],
    tags: ["규제", "공공정책"],
  },
  {
    name: "국제문화대학원",
    icon: "🌍",
    majors: ["문화정책", "국제협력"],
    tags: ["글로벌", "혁신문화"],
  },
];

function MainPage() {
  const navigate = useNavigate();
  const [selectedSchool, setSelectedSchool] = useState("");

  const handleCardClick = (schoolName) => {
    setSelectedSchool(schoolName);
    navigate("/applicant-form", { state: { school: schoolName } });
  };

  return (
    <div className="main-page">
      <div className="main-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-wrapper">
            <Logo />
          </div>
          <p className="slogan">
            연구를 위한 첫 걸음은{" "}
            <span className="slogan-highlight">올바른 매칭</span>에서 시작됩니다
          </p>
        </div>

        {/* Promotional Banner */}
        <div className="promo-banner">
          <img
            src="/promo.png"
            alt="서강 MOT 대학원 2026학년도 전기 신입생 모집"
            className="promo-image"
          />
        </div>

        {/* University Selection */}
        <div className="selection-section">
          <div className="section-header">
            <h2 className="section-title">대학원 과정을 선택해주세요</h2>
          </div>
          <p className="section-description">
            AI 교수 Twin이 교수님의 멘토링 성향을 분석해 나와 가장 잘 맞는
            지도교수를 추천해드립니다
          </p>
          <div className="university-list">
            {graduateSchools.map((school) => {
              const isMOT = school.name === "기술경영전문대학원(MOT)";
              const isDisabled = !isMOT;

              return (
                <button
                  key={school.name}
                  className={`university-card ${
                    selectedSchool === school.name ? "selected" : ""
                  } ${isDisabled ? "disabled" : ""}`}
                  onClick={() => !isDisabled && handleCardClick(school.name)}
                  disabled={isDisabled}
                >
                  {selectedSchool === school.name && (
                    <div className="checkmark">✓</div>
                  )}
                  <div className="card-content">
                    <div className="card-name">{school.name}</div>
                    <div className="majors-list">
                      {school.majors.join(", ")}
                    </div>
                    <div className="tags-list">
                      {school.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
