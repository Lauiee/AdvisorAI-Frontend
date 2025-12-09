import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">
          Advisor.AI가 최적의 지도교수를 분석 중입니다...
        </h2>
        <p className="loading-subtitle">
          입력 데이터 기반, 5축 적합도 모델 연산 중
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
