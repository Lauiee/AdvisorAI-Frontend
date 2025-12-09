import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import "./ApplicantForm.css";

const interestKeywords = [
  "디지털전환",
  "조직학습",
  "기술혁신",
  "기술전략",
  "지속가능경영",
];

const learningStyles = [
  "사례 기반",
  "협업형",
  "탐구형",
  "자율형",
  "피드백 선호",
  "실증 분석",
];

function ApplicantForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSchool = location.state?.school || "기술경영전문대학원(MOT)";

  const [formData, setFormData] = useState({
    name: "",
    major: "",
    interestKeyword: "",
    learningStyles: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeywordToggle = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      interestKeyword: prev.interestKeyword === keyword ? "" : keyword,
    }));
  };

  const handleLearningStyleToggle = (style) => {
    setFormData((prev) => {
      const styles = prev.learningStyles.includes(style)
        ? prev.learningStyles.filter((s) => s !== style)
        : [...prev.learningStyles, style];
      return { ...prev, learningStyles: styles };
    });
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push("이름");
    }
    if (!formData.major.trim()) {
      errors.push("전공");
    }
    if (!formData.interestKeyword) {
      errors.push("관심 키워드");
    }
    if (formData.learningStyles.length === 0) {
      errors.push("학습 성향");
    }

    return errors;
  };

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

  const handleSubmit = async () => {
    const errors = validateForm();

    if (errors.length > 0) {
      showToastMessage(`다음 항목을 모두 입력해주세요: ${errors.join(", ")}`);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: API 호출
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const result = await response.json();

      // 임시로 3초 대기 (실제 API 호출로 대체)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 결과 페이지로 이동 (목 데이터와 함께 전달)
      navigate('/results', {
        state: {
          formData: formData,
          school: selectedSchool,
          applicantData: {
            name: formData.name,
            major: formData.major,
            keyword: formData.interestKeyword,
            learningStyles: formData.learningStyles,
          },
          // TODO: API 응답으로 교수 목록 받아오기
          professors: null, // API 응답으로 대체 예정
        },
      });
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="applicant-form-page">
      <div className="applicant-form-container">
        {/* Header */}
        <div className="form-header">
          <div className="header-red-bar"></div>
          <div className="header-content">
            <div className="header-left">
              <span className="header-label">선택 학과:</span>
              <span className="department-name">{selectedSchool}</span>
            </div>
            <div className="header-divider"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card">
          <div className="form-title">Step 1 - 지원자 입력</div>

          {/* Name Input */}
          <div className="form-field">
            <label className="field-label">이름</label>
            <input
              type="text"
              className="text-input"
              placeholder="이름을 입력해주세요"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          {/* Major Input */}
          <div className="form-field">
            <label className="field-label">전공</label>
            <input
              type="text"
              className="text-input"
              placeholder="전공을 입력해주세요"
              value={formData.major}
              onChange={(e) => handleInputChange("major", e.target.value)}
            />
          </div>

          {/* Interest Keywords */}
          <div className="form-field">
            <label className="field-label">
              관심 키워드 <span className="field-hint">(토큰 선택)</span>
            </label>
            <div className="token-list">
              {interestKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  className={`token-button ${
                    formData.interestKeyword === keyword ? "selected" : ""
                  }`}
                  onClick={() => handleKeywordToggle(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Styles */}
          <div className="form-field">
            <label className="field-label">
              학습 성향 <span className="field-hint">(멀티선택)</span>
            </label>
            <div className="token-list">
              {learningStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`token-button ${
                    formData.learningStyles.includes(style) ? "selected" : ""
                  }`}
                  onClick={() => handleLearningStyleToggle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button className="submit-button" onClick={handleSubmit}>
            <span className="submit-icon">🔍</span>
            Advisor.AI 분석 시작하기
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-icon">⚠️</span>
            <span className="toast-message">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantForm;
