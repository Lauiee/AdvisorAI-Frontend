import "./FinalResultsLoadingScreen.css";

function FinalResultsLoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">
          Advisor.AI가 최종 적합도를 분석 중입니다...
        </h2>
        <p className="loading-subtitle">
          최초 매칭 데이터와 AI Twin과의 대화 내용을 종합하여 최종 적합도
          리포트를 작성 중
        </p>
      </div>
    </div>
  );
}

export default FinalResultsLoadingScreen;
